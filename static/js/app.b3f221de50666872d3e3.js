webpackJsonp([93],{

/***/ 1003:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* eslint-disable */
/*
 * BeatDetektor.js
 *
 * BeatDetektor - CubicFX Visualizer Beat Detection & Analysis Algorithm
 * Javascript port by Charles J. Cliffe and Corban Brook
 *
 * Copyright (c) 2009 Charles J. Cliffe.
 *
 * BeatDetektor is distributed under the terms of the MIT License.
 * http://opensource.org/licenses/MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */



/*
 BeatDetektor class


 Theory:

 Trigger detection is performed using a trail of moving averages,

 The FFT input is broken up into 128 ranges and averaged, each range has two moving
 averages that tail each other at a rate of (1.0 / BD_DETECTION_RATE) seconds.

 Each time the moving average for a range exceeds it's own tailing average by:

 (moving_average[range] * BD_DETECTION_FACTOR >= moving_average[range])

 if this is true there's a rising edge and a detection is flagged for that range.
 Next a trigger gap test is performed between rising edges and timestamp recorded.

 If the gap is larger than our BPM window (in seconds) then we can discard it and
 reset the timestamp for a new detection -- but only after checking to see if it's a
 reasonable match for 2* the current detection in case it's only triggered every
 other beat. Gaps that are lower than the BPM window are ignored and the last
 timestamp will not be reset.

 Gaps that are within a reasonable window are run through a quality stage to determine
 how 'close' they are to that channel's current prediction and are incremented or
 decremented by a weighted value depending on accuracy. Repeated hits of low accuracy
 will still move a value towards erroneous detection but it's quality will be lowered
 and will not be eligible for the gap time quality draft.

 Once quality has been assigned ranges are reviewed for good match candidates and if
 BD_MINIMUM_CONTRIBUTIONS or more ranges achieve a decent ratio (with a factor of
 BD_QUALITY_TOLERANCE) of contribution to the overall quality we take them into the
 contest round.  Note that the contest round  won't run on a given process() call if
 the total quality achieved does not meet or exceed BD_QUALITY_TOLERANCE.

 Each time through if a select draft of BPM ranges has achieved a reasonable quality
 above others it's awarded a value in the BPM contest.  The BPM contest is a hash
 array indexed by an integer BPM value, each draft winner is awarded BD_QUALITY_REWARD.

 Finally the BPM contest is examined to determine a leader and all contest entries
 are normalized to a total value of BD_FINISH_LINE, whichever range is closest to
 BD_FINISH_LINE at any given point is considered to be the best guess however waiting
 until a minimum contest winning value of about 20.0-25.0 will provide more accurate
 results.  Note that the 20-25 rule may vary with lower and higher input ranges.
 A winning value that exceeds 40 or hovers around 60 (the finish line) is pretty much
 a guaranteed match.


 Configuration Kernel Notes:

 The majority of the ratios and values have been reverse-engineered from my own
 observation and visualization of information from various aspects of the detection
 triggers; so not all parameters have a perfect definition nor perhaps the best value yet.
 However despite this it performs very well; I had expected several more layers
 before a reasonable detection would be achieved. Comments for these parameters will be
 updated as analysis of their direct effect is explored.


 Input Restrictions:

 bpm_maximum must be within the range of (bpm_minimum*2)-1
 i.e. minimum of 50 must have a maximum of 99 because 50*2 = 100


 Changelog:

 01/17/2010 - Charles J. Cliffe
  - Tested and tweaked default kernel values for tighter detection
  - Added BeatDetektor.config_48_95, BeatDetektor.config_90_179 and BeatDetektor.config_150_280 for more refined detection ranges
  - Updated unit test to include new range config example

02/21/2010 - Charles J. Cliffe
 - Fixed numerous bugs and divide by 0 on 1% match causing poor accuracy
 - Re-worked the quality calulations, accuracy improved 8-10x
 - Primary value is now a fractional reading (*10, just divide by 10), added win_bpm_int_lo for integral readings
 - Added feedback loop for current_bpm to help back-up low quality channels
 - Unified range configs, now single default should be fine
 - Extended quality reward 'funnel'

*/
const BeatDetektor = function(bpm_minimum, bpm_maximum, alt_config)
{
	if (typeof(bpm_minimum)=='undefined') bpm_minimum = 85.0;
	if (typeof(bpm_maximum)=='undefined') bpm_maximum = 169.0

	this.config = (typeof(alt_config)!='undefined')?alt_config:BeatDetektor.config;

	this.BPM_MIN = bpm_minimum;
	this.BPM_MAX = bpm_maximum;

	this.beat_counter = 0;
	this.half_counter = 0;
	this.quarter_counter = 0;

	// current average (this sample) for range n
	this.a_freq_range = new Array(this.config.BD_DETECTION_RANGES);
	// moving average of frequency range n
	this.ma_freq_range = new Array(this.config.BD_DETECTION_RANGES);
	// moving average of moving average of frequency range n
	this.maa_freq_range = new Array(this.config.BD_DETECTION_RANGES);
	// timestamp of last detection for frequecy range n
	this.last_detection = new Array(this.config.BD_DETECTION_RANGES);

	// moving average of gap lengths
	this.ma_bpm_range = new Array(this.config.BD_DETECTION_RANGES);
	// moving average of moving average of gap lengths
	this.maa_bpm_range = new Array(this.config.BD_DETECTION_RANGES);

	// range n quality attribute, good match  = quality+, bad match  = quality-, min  = 0
	this.detection_quality = new Array(this.config.BD_DETECTION_RANGES);

	// current trigger state for range n
	this.detection = new Array(this.config.BD_DETECTION_RANGES);

	this.reset();

	if (typeof(console)!='undefined')
	{
		console.log("BeatDetektor("+this.BPM_MIN+","+this.BPM_MAX+") created.")
	}
}

BeatDetektor.prototype.reset = function()
{
//	var bpm_avg = 60.0/((this.BPM_MIN+this.BPM_MAX)/2.0);

	for (var i = 0; i < this.config.BD_DETECTION_RANGES; i++)
	{
		this.a_freq_range[i] = 0.0;
		this.ma_freq_range[i] = 0.0;
		this.maa_freq_range[i] = 0.0;
		this.last_detection[i] = 0.0;

		this.ma_bpm_range[i] =
		this.maa_bpm_range[i] = 60.0/this.BPM_MIN + ((60.0/this.BPM_MAX-60.0/this.BPM_MIN) * (i/this.config.BD_DETECTION_RANGES));

		this.detection_quality[i] = 0.0;
		this.detection[i] = false;
	}

	this.ma_quality_avg = 0;
	this.ma_quality_total = 0;

	this.bpm_contest = new Array();
	this.bpm_contest_lo = new Array();

	this.quality_total = 0.0;
	this.quality_avg = 0.0;

	this.current_bpm = 0.0;
	this.current_bpm_lo = 0.0;

	this.winning_bpm = 0.0;
	this.win_val = 0.0;
	this.winning_bpm_lo = 0.0;
	this.win_val_lo = 0.0;

	this.win_bpm_int = 0;
	this.win_bpm_int_lo = 0;

	this.bpm_predict = 0;

	this.is_erratic = false;
	this.bpm_offset = 0.0;
	this.last_timer = 0.0;
	this.last_update = 0.0;

	this.bpm_timer = 0.0;
	this.beat_counter = 0;
	this.half_counter = 0;
	this.quarter_counter = 0;
}


BeatDetektor.config_default = {
	BD_DETECTION_RANGES : 128,  // How many ranges to quantize the FFT into
	BD_DETECTION_RATE : 12.0,   // Rate in 1.0 / BD_DETECTION_RATE seconds
	BD_DETECTION_FACTOR : 0.915, // Trigger ratio
	BD_QUALITY_DECAY : 0.6,     // range and contest decay
	BD_QUALITY_TOLERANCE : 0.96,// Use the top x % of contest results
	BD_QUALITY_REWARD : 10.0,    // Award weight
	BD_QUALITY_STEP : 0.1,     // Award step (roaming speed)
	BD_MINIMUM_CONTRIBUTIONS : 6,   // At least x ranges must agree to process a result
	BD_FINISH_LINE : 60.0,          // Contest values wil be normalized to this finish line
	// this is the 'funnel' that pulls ranges in / out of alignment based on trigger detection
	BD_REWARD_TOLERANCES : [ 0.001, 0.005, 0.01, 0.02, 0.04, 0.08, 0.10, 0.15, 0.30 ],  // .1%, .5%, 1%, 2%, 4%, 8%, 10%, 15%
	BD_REWARD_MULTIPLIERS : [ 20.0, 10.0, 8.0, 1.0, 1.0/2.0, 1.0/4.0, 1.0/8.0, 1/16.0, 1/32.0 ]
};


// Default configuration kernel
BeatDetektor.config = BeatDetektor.config_default;


BeatDetektor.prototype.process = function(timer_seconds, fft_data)
{
	if (!this.last_timer) { this.last_timer = timer_seconds; return; }	// ignore 0 start time
	if (this.last_timer > timer_seconds) { this.reset(); return; }

	var timestamp = timer_seconds;

	this.last_update = timer_seconds - this.last_timer;
	this.last_timer = timer_seconds;

	if (this.last_update > 1.0) { this.reset(); return; }

	var i,x;
	var v;

	var bpm_floor = 60.0/this.BPM_MAX;
	var bpm_ceil = 60.0/this.BPM_MIN;

	var range_step = (fft_data.length / this.config.BD_DETECTION_RANGES);
	var range = 0;


	for (x=0; x<fft_data.length; x+=range_step)
	{
		this.a_freq_range[range] = 0;

		// accumulate frequency values for this range
		for (i = x; i<x+range_step; i++)
		{
			v = Math.abs(fft_data[i]);
			this.a_freq_range[range] += v;
		}

		// average for range
		this.a_freq_range[range] /= range_step;

		// two sets of averages chase this one at a

		// moving average, increment closer to a_freq_range at a rate of 1.0 / BD_DETECTION_RATE seconds
		this.ma_freq_range[range] -= (this.ma_freq_range[range]-this.a_freq_range[range])*this.last_update*this.config.BD_DETECTION_RATE;
		// moving average of moving average, increment closer to this.ma_freq_range at a rate of 1.0 / BD_DETECTION_RATE seconds
		this.maa_freq_range[range] -= (this.maa_freq_range[range]-this.ma_freq_range[range])*this.last_update*this.config.BD_DETECTION_RATE;

		// if closest moving average peaks above trailing (with a tolerance of BD_DETECTION_FACTOR) then trigger a detection for this range
		var det = (this.ma_freq_range[range]*this.config.BD_DETECTION_FACTOR >= this.maa_freq_range[range]);

		// compute bpm clamps for comparison to gap lengths

		// clamp detection averages to input ranges
		if (this.ma_bpm_range[range] > bpm_ceil) this.ma_bpm_range[range] = bpm_ceil;
		if (this.ma_bpm_range[range] < bpm_floor) this.ma_bpm_range[range] = bpm_floor;
		if (this.maa_bpm_range[range] > bpm_ceil) this.maa_bpm_range[range] = bpm_ceil;
		if (this.maa_bpm_range[range] < bpm_floor) this.maa_bpm_range[range] = bpm_floor;

		var rewarded = false;

		// new detection since last, test it's quality
		if (!this.detection[range] && det)
		{
			// calculate length of gap (since start of last trigger)
			var trigger_gap = timestamp-this.last_detection[range];

			// trigger falls within acceptable range,
			if (trigger_gap < bpm_ceil && trigger_gap > (bpm_floor))
			{
				// compute gap and award quality

				// use our tolerances as a funnel to edge detection towards the most likely value
				for (i = 0; i < this.config.BD_REWARD_TOLERANCES.length; i++)
				{
					if (Math.abs(this.ma_bpm_range[range]-trigger_gap) < this.ma_bpm_range[range]*this.config.BD_REWARD_TOLERANCES[i])
					{
						this.detection_quality[range] += this.config.BD_QUALITY_REWARD * this.config.BD_REWARD_MULTIPLIERS[i];
						rewarded = true;
					}
				}

				if (rewarded)
				{
					this.last_detection[range] = timestamp;
				}
			}
			else if (trigger_gap >= bpm_ceil) // low quality, gap exceeds maximum time
			{
				// start a new gap test, next gap is guaranteed to be longer

				// test for 1/2 beat
				trigger_gap /= 2.0;

				if (trigger_gap < bpm_ceil && trigger_gap > (bpm_floor)) for (i = 0; i < this.config.BD_REWARD_TOLERANCES.length; i++)
				{
					if (Math.abs(this.ma_bpm_range[range]-trigger_gap) < this.ma_bpm_range[range]*this.config.BD_REWARD_TOLERANCES[i])
					{
						this.detection_quality[range] += this.config.BD_QUALITY_REWARD * this.config.BD_REWARD_MULTIPLIERS[i];
						rewarded = true;
					}
				}


				// decrement quality if no 1/2 beat reward
				if (!rewarded)
				{
					trigger_gap *= 2.0;
				}
				this.last_detection[range] = timestamp;
			}

			if (rewarded)
			{
				var qmp = (this.detection_quality[range]/this.quality_avg)*this.config.BD_QUALITY_STEP;
				if (qmp > 1.0)
				{
					qmp = 1.0;
				}

				this.ma_bpm_range[range] -= (this.ma_bpm_range[range]-trigger_gap) * qmp;
				this.maa_bpm_range[range] -= (this.maa_bpm_range[range]-this.ma_bpm_range[range]) * qmp;
			}
			else if (trigger_gap >= bpm_floor && trigger_gap <= bpm_ceil)
			{
				if (this.detection_quality[range] < this.quality_avg*this.config.BD_QUALITY_TOLERANCE && this.current_bpm)
				{
					this.ma_bpm_range[range] -= (this.ma_bpm_range[range]-trigger_gap) * this.config.BD_QUALITY_STEP;
					this.maa_bpm_range[range] -= (this.maa_bpm_range[range]-this.ma_bpm_range[range]) * this.config.BD_QUALITY_STEP;
				}
				this.detection_quality[range] -= this.config.BD_QUALITY_STEP;
			}
			else if (trigger_gap >= bpm_ceil)
			{
				if ((this.detection_quality[range] < this.quality_avg*this.config.BD_QUALITY_TOLERANCE) && this.current_bpm)
				{
					this.ma_bpm_range[range] -= (this.ma_bpm_range[range]-this.current_bpm) * 0.5;
					this.maa_bpm_range[range] -= (this.maa_bpm_range[range]-this.ma_bpm_range[range]) * 0.5 ;
				}
				this.detection_quality[range]-= this.config.BD_QUALITY_STEP;
			}

		}

		if ((!rewarded && timestamp-this.last_detection[range] > bpm_ceil) || (det && Math.abs(this.ma_bpm_range[range]-this.current_bpm) > this.bpm_offset))
			this.detection_quality[range] -= this.detection_quality[range]*this.config.BD_QUALITY_STEP*this.config.BD_QUALITY_DECAY*this.last_update;

		// quality bottomed out, set to 0
		if (this.detection_quality[range] < 0.001) this.detection_quality[range]=0.001;

		this.detection[range] = det;

		range++;
	}

	// total contribution weight
	this.quality_total = 0;

	// total of bpm values
	var bpm_total = 0;
	// number of bpm ranges that contributed to this test
	var bpm_contributions = 0;


	// accumulate quality weight total
	for (var x=0; x<this.config.BD_DETECTION_RANGES; x++)
	{
		this.quality_total += this.detection_quality[x];
	}


	this.quality_avg = this.quality_total / this.config.BD_DETECTION_RANGES;


	if (this.quality_total)
	{
		// determine the average weight of each quality range
		this.ma_quality_avg += (this.quality_avg - this.ma_quality_avg) * this.last_update * this.config.BD_DETECTION_RATE/2.0;

		this.maa_quality_avg += (this.ma_quality_avg - this.maa_quality_avg) * this.last_update;
		this.ma_quality_total += (this.quality_total - this.ma_quality_total) * this.last_update * this.config.BD_DETECTION_RATE/2.0;

		this.ma_quality_avg -= 0.98*this.ma_quality_avg*this.last_update*3.0;
	}
	else
	{
		this.quality_avg = 0.001;
	}

	if (this.ma_quality_total <= 0) this.ma_quality_total = 0.001;
	if (this.ma_quality_avg <= 0) this.ma_quality_avg = 0.001;

	var avg_bpm_offset = 0.0;
	var offset_test_bpm = this.current_bpm;
	var draft = new Array();

	if (this.quality_avg) for (x=0; x<this.config.BD_DETECTION_RANGES; x++)
	{
		// if this detection range weight*tolerance is higher than the average weight then add it's moving average contribution
		if (this.detection_quality[x]*this.config.BD_QUALITY_TOLERANCE >= this.ma_quality_avg)
		{
			if (this.ma_bpm_range[x] < bpm_ceil && this.ma_bpm_range[x] > bpm_floor)
			{
				bpm_total += this.maa_bpm_range[x];

				var draft_float = Math.round((60.0/this.maa_bpm_range[x])*1000.0);

				draft_float = (Math.abs(Math.ceil(draft_float)-(60.0/this.current_bpm)*1000.0)<(Math.abs(Math.floor(draft_float)-(60.0/this.current_bpm)*1000.0)))?Math.ceil(draft_float/10.0):Math.floor(draft_float/10.0);
				var draft_int = parseInt(draft_float/10.0);
			//	if (draft_int) console.log(draft_int);
				if (typeof(draft[draft_int]=='undefined')) draft[draft_int] = 0;

				draft[draft_int]+=this.detection_quality[x]/this.quality_avg;
				bpm_contributions++;
				if (offset_test_bpm == 0.0) offset_test_bpm = this.maa_bpm_range[x];
				else
				{
					avg_bpm_offset += Math.abs(offset_test_bpm-this.maa_bpm_range[x]);
				}


			}
		}
	}

	// if we have one or more contributions that pass criteria then attempt to display a guess
	var has_prediction = (bpm_contributions>=this.config.BD_MINIMUM_CONTRIBUTIONS)?true:false;

	var draft_winner=0;
	var win_val = 0;

	if (has_prediction)
	{
		for (var draft_i in draft)
		{
			if (draft[draft_i] > win_val)
			{
				win_val = draft[draft_i];
				draft_winner = draft_i;
			}
		}

		this.bpm_predict = 60.0/(draft_winner/10.0);

		avg_bpm_offset /= bpm_contributions;
		this.bpm_offset = avg_bpm_offset;

		if (!this.current_bpm)
		{
			this.current_bpm = this.bpm_predict;
		}
	}

	if (this.current_bpm && this.bpm_predict) this.current_bpm -= (this.current_bpm-this.bpm_predict)*this.last_update;

	// hold a contest for bpm to find the current mode
	var contest_max=0;

	for (var contest_i in this.bpm_contest)
	{
		if (contest_max < this.bpm_contest[contest_i]) contest_max = this.bpm_contest[contest_i];
		if (this.bpm_contest[contest_i] > this.config.BD_FINISH_LINE/2.0)
		{
			var draft_int_lo = parseInt(Math.round((contest_i)/10.0));
			if (this.bpm_contest_lo[draft_int_lo] != this.bpm_contest_lo[draft_int_lo]) this.bpm_contest_lo[draft_int_lo] = 0;
			this.bpm_contest_lo[draft_int_lo]+= (this.bpm_contest[contest_i]/6.0)*this.last_update;
		}
	}

	// normalize to a finish line
	if (contest_max > this.config.BD_FINISH_LINE)
	{
		for (var contest_i in this.bpm_contest)
		{
			this.bpm_contest[contest_i]=(this.bpm_contest[contest_i]/contest_max)*this.config.BD_FINISH_LINE;
		}
	}

	contest_max = 0;
	for (var contest_i in this.bpm_contest_lo)
	{
		if (contest_max < this.bpm_contest_lo[contest_i]) contest_max = this.bpm_contest_lo[contest_i];
	}

	// normalize to a finish line
	if (contest_max > this.config.BD_FINISH_LINE)
	{
		for (var contest_i in this.bpm_contest_lo)
		{
			this.bpm_contest_lo[contest_i]=(this.bpm_contest_lo[contest_i]/contest_max)*this.config.BD_FINISH_LINE;
		}
	}


	// decay contest values from last loop
	for (contest_i in this.bpm_contest)
	{
		this.bpm_contest[contest_i]-=this.bpm_contest[contest_i]*(this.last_update/this.config.BD_DETECTION_RATE);
	}

	// decay contest values from last loop
	for (contest_i in this.bpm_contest_lo)
	{
		this.bpm_contest_lo[contest_i]-=this.bpm_contest_lo[contest_i]*(this.last_update/this.config.BD_DETECTION_RATE);
	}

	this.bpm_timer+=this.last_update;

	var winner = 0;
	var winner_lo = 0;

	// attempt to display the beat at the beat interval ;)
	if (this.bpm_timer > this.winning_bpm/4.0 && this.current_bpm)
	{
		this.win_val = 0;
		this.win_val_lo = 0;

		if (this.winning_bpm) while (this.bpm_timer > this.winning_bpm/4.0) this.bpm_timer -= this.winning_bpm/4.0;

		// increment beat counter

		this.quarter_counter++;
		this.half_counter= parseInt(this.quarter_counter/2);
		this.beat_counter = parseInt(this.quarter_counter/4);

		// award the winner of this iteration
		var idx = parseInt(Math.round((60.0/this.current_bpm)*10.0));
		if (typeof(this.bpm_contest[idx])=='undefined') this.bpm_contest[idx] = 0;
		this.bpm_contest[idx]+=this.config.BD_QUALITY_REWARD;


		// find the overall winner so far
		for (var contest_i in this.bpm_contest)
		{
			if (this.win_val < this.bpm_contest[contest_i])
			{
				winner = contest_i;
				this.win_val = this.bpm_contest[contest_i];
			}
		}

		if (winner)
		{
			this.win_bpm_int = parseInt(winner);
			this.winning_bpm = (60.0/(winner/10.0));
		}

		// find the overall winner so far
		for (var contest_i in this.bpm_contest_lo)
		{
			if (this.win_val_lo < this.bpm_contest_lo[contest_i])
			{
				winner_lo = contest_i;
				this.win_val_lo = this.bpm_contest_lo[contest_i];
			}
		}

		if (winner_lo)
		{
			this.win_bpm_int_lo = parseInt(winner_lo);
			this.winning_bpm_lo = 60.0/winner_lo;
		}


		//if (typeof(console)!='undefined' && (this.beat_counter % 4) == 0) console.log("BeatDetektor("+this.BPM_MIN+","+this.BPM_MAX+"): [ Current Estimate: "+winner+" BPM ] [ Time: "+(parseInt(timer_seconds*1000.0)/1000.0)+"s, Quality: "+(parseInt(this.quality_total*1000.0)/1000.0)+", Rank: "+(parseInt(this.win_val*1000.0)/1000.0)+", Jitter: "+(parseInt(this.bpm_offset*1000000.0)/1000000.0)+" ]");
	}

}

// Sample Modules
BeatDetektor.modules = new Object();
BeatDetektor.modules.vis = new Object();

// simple bass kick visualizer assistant module
BeatDetektor.modules.vis.BassKick = function()
{
	this.is_kick = false;
}

BeatDetektor.modules.vis.BassKick.prototype.process = function(det)
{
	this.is_kick = ((det.detection[0] && det.detection[1]) || (det.ma_freq_range[0]/det.maa_freq_range[0])>1.4);
}

BeatDetektor.modules.vis.BassKick.prototype.isKick = function()
{
	return this.is_kick;
}


// simple vu spectrum visualizer assistant module
BeatDetektor.modules.vis.VU = function()
{
	this.vu_levels = new Array();
}

BeatDetektor.modules.vis.VU.prototype.process = function(det,lus)
{
		var i,det_val,det_max = 0.0;
		if (typeof(lus)=='undefined') lus = det.last_update;

		for (i = 0; i < det.config.BD_DETECTION_RANGES; i++)
		{
			det_val = (det.ma_freq_range[i]/det.maa_freq_range[i]);
			if (det_val > det_max) det_max = det_val;
		}

		if (det_max <= 0) det_max = 1.0;

		for (i = 0; i < det.config.BD_DETECTION_RANGES; i++)
		{
			det_val = (det.ma_freq_range[i]/det.maa_freq_range[i]); //fabs(fftData[i*2]/2.0);

			if (det_val != det_val) det_val = 0;

			//&& (det_val > this.vu_levels[i])
			if (det_val>1.0)
			{
				det_val -= 1.0;
				if (det_val>1.0) det_val = 1.0;

				if (det_val > this.vu_levels[i])
					this.vu_levels[i] = det_val;
				else if (det.current_bpm) this.vu_levels[i] -= (this.vu_levels[i]-det_val)*lus*(1.0/det.current_bpm)*3.0;
			}
			else
			{
				if (det.current_bpm) this.vu_levels[i] -= (lus/det.current_bpm)*2.0;
			}

			if (this.vu_levels[i] < 0 || this.vu_levels[i] != this.vu_levels[i]) this.vu_levels[i] = 0;
		}
}


// returns vu level for BD_DETECTION_RANGES range[x]
BeatDetektor.modules.vis.VU.prototype.getLevel = function(x)
{
	return this.vu_levels[x];
}

/* harmony default export */ __webpack_exports__["a"] = (BeatDetektor);

/***/ }),

/***/ 1004:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = isDescendant;
function isDescendant(parent, child) {
  let node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}


/***/ }),

/***/ 1005:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);


const state = {
  menus: {},
  activeMenus: [],
  visible: false,
  hooks: {
    default: [],
  },
};

// getters
const getters = {
  menus: state => state.menus,
  menu: state => id => state.menus[id],
  activeMenus: state => state.activeMenus.map(id => state.menus[id]),
  realActiveMenus: state => state.activeMenus,
  hooks: state => state.hooks,
};

// actions
const actions = {
  popdown({ commit }, { id }) {
    commit('popdown', { id });
  },
  popdownAll({ commit }, not) {
    commit('popdownAll', not);
  },
  popup({ commit }, { id, x, y }) {
    commit('popup', { id, x, y });
  },
};

// mutations
const mutations = {
  addMenu(state, { Menu, id }) {
    // if(state.menus[id] && !force) return;
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.menus, id, Menu);
  },
  popdown(state, { id }) {
    const indexToSplice = state.activeMenus.indexOf(id);
    if (indexToSplice < 0) return;
    state.activeMenus.splice(indexToSplice, 1);
  },
  popdownAll(state, not) {
    let toKeep = [];
    if (not) toKeep = toKeep.concat(not);

    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state, 'activeMenus', toKeep);
  },
  popup(state, { id, x, y }) {
    const existingMenuId = state.activeMenus.indexOf(id);
    if (existingMenuId < 0) state.activeMenus.push(id);
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.menus[id], 'x', x);
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.menus[id], 'y', y);
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.menus[id], 'visible', true);
  },
  editItemProperty(state, { id, index, property, value }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.menus[id].items[index], property, value);
  },
  addHook(state, { hookName, hook }) {
    if (!(hookName in state.hooks)) {
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.hooks, hookName, []);
    }

    const hookArray = state.hooks[hookName];
    hookArray.push(hook);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1006:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_mathjs__ = __webpack_require__(1240);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_mathjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_mathjs__);




const state = {
  // menus: {},
  assignments: {},
  visible: false,
  activeControlData: {
    moduleName: '',
    controlVariable: '',
  },
  delta: 0,
};

// getters
const getters = {
  assignments: state => state.assignments,
  activeControlData: state => state.activeControlData,
  assignment: state => (moduleName, controlVariable) => {
    if (!state.assignments[moduleName]) return false;
    return state.assignments[moduleName][controlVariable];
  },
  delta: state => state.delta,
  // menu: state => id => state.menus[id],
  // activeMenus: state => state.activeMenus.map(id => state.menus[id])
};

function compileExpression(expression, additionalScope = {}) {
  const scope = { value: 0, delta: 0, map: window.Math.map };

  Object.keys(additionalScope).forEach((key) => {
    scope[key] = additionalScope[key];
  });

  // provide a scope
  let newFunction;
  try {
    const node = __WEBPACK_IMPORTED_MODULE_2_mathjs___default.a.parse(expression, scope);

    newFunction = node.compile();
    newFunction.eval(scope);
  } catch (e) {
    return false;
  }

  return newFunction;
}

// actions
const actions = {
  addExpression({ commit }, { expression, moduleName, controlVariable, scopeAdditions }) {
    const Module = __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].state.modVModules.active[moduleName];
    if (!Module) return;
    if (typeof Module.props[controlVariable] === 'undefined') return;

    let additionalScope = {};
    const existingModuleAssignment = state.assignments[moduleName];
    if (existingModuleAssignment) {
      if (controlVariable in existingModuleAssignment) {
        additionalScope = existingModuleAssignment[controlVariable].additionalScope;
      }
    }

    if (scopeAdditions) {
      Object.keys(scopeAdditions).forEach((key) => {
        additionalScope[key] = eval(`(${scopeAdditions[key]})`); //eslint-disable-line
      });
    }

    let exp = expression;
    if (!exp) exp = 'value';

    const func = compileExpression(exp, additionalScope);
    if (!func) return;

    const assignment = {
      func,
      expression: exp,
      additionalScope,
      moduleName,
      controlVariable,
    };

    commit('addExpression', { assignment });
  },
  setActiveControlData({ commit }, { moduleName, controlVariable }) {
    commit('setActiveControlData', { moduleName, controlVariable });
  },
  addToScope({ commit, dispatch }, { moduleName, controlVariable, scopeAdditions }) {
    const assignmentModule = state.assignments[moduleName];
    if (!assignmentModule) dispatch('addExpression', { moduleName, controlVariable });

    const assignmentVariable = state.assignments[moduleName][controlVariable];
    if (!assignmentVariable) dispatch('addExpression', { moduleName, controlVariable });

    commit('addToScope', { moduleName, controlVariable, scopeAdditions });

    const expression = state.assignments[moduleName][controlVariable].expression;
    const additionalScope = state.assignments[moduleName][controlVariable].additionalScope;
    const expressionFunction = compileExpression(expression, additionalScope);
    if (!expressionFunction) return;
    commit('setExpressionFunction', { moduleName, controlVariable, expressionFunction });
  },
};

// mutations
const mutations = {
  addExpression(state, { assignment }) {
    if (!state.assignments[assignment.moduleName]) {
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.assignments, assignment.moduleName, {});
    }

    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.assignments[assignment.moduleName], assignment.controlVariable, assignment);
  },
  addToScope(state, { moduleName, controlVariable, scopeAdditions }) {
    const additionalScope = state.assignments[moduleName][controlVariable].additionalScope || {};
    Object.keys(scopeAdditions).forEach((key) => {
      additionalScope[key] = eval(`(${scopeAdditions[key]})`); //eslint-disable-line
    });

    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.assignments[moduleName][controlVariable], 'additionalScope', additionalScope);
  },
  setExpressionFunction(state, { moduleName, controlVariable, expressionFunction }) {
    if (!state.assignments[moduleName][controlVariable]) return;

    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.assignments[moduleName][controlVariable], 'func', expressionFunction);
  },
  removeExpression(state, { moduleName, controlVariable }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(state.assignments[moduleName], controlVariable);
  },
  removeExpressions(state, { moduleName }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(state.assignments, moduleName);
  },
  setActiveControlData(state, { moduleName, controlVariable }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.activeControlData, 'moduleName', moduleName);
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.activeControlData, 'controlVariable', controlVariable);
  },
  setDelta(state, { delta }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state, 'delta', delta);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1007:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);


const state = {
  selectionX: 0,
  selectionY: 0,
  showCanvas: false,
  url: 'ws://localhost:3000/modV',
};

// mutations
const mutations = {
  setSelection(state, { selectionX, selectionY }) {
    if (selectionX) __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state, 'selectionX', selectionX);
    if (selectionY) __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state, 'selectionY', selectionY);
  },

  setShowCanvas(state, { showCanvas }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state, 'showCanvas', showCanvas);
  },

  setUrl(state, { url }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state, 'url', url);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  mutations,
});


/***/ }),

/***/ 1008:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lfo_for_modv__ = __webpack_require__(1093);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lfo_for_modv___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lfo_for_modv__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__store__ = __webpack_require__(16);




const state = {
  assignments: {},
  visible: false,
  activeControlData: {
    moduleName: '',
    controlVariable: '',
  },
};

const getters = {
  assignments: state => state.assignments,
  activeControlData: state => state.activeControlData,
  assignment: state => ({ moduleName, controlVariable }) => {
    if (!state.assignments[moduleName]) return false;
    return state.assignments[moduleName][controlVariable];
  },
};

const actions = {
  addAssignment({ commit }, {
    moduleName,
    controlVariable,
    group,
    groupName,
    waveform,
    frequency,
  }) {
    const Module = __WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */].state.modVModules.active[moduleName];
    if (!Module) return;
    if (typeof Module.props[controlVariable] === 'undefined') return;

    const controller = new __WEBPACK_IMPORTED_MODULE_0_lfo_for_modv___default.a({
      waveform,
      freq: frequency,
    });

    const assignment = {
      moduleName,
      controlVariable,
      group,
      groupName,
      controller,
      waveform,
      useBpm: true,
    };

    commit('addAssignment', { assignment });
  },
  setActiveControlData({ commit }, { moduleName, controlVariable }) {
    commit('setActiveControlData', { moduleName, controlVariable });
  },
  updateBpmFrequency({ commit, state }, { frequency }) {
    Object.keys(state.assignments).forEach((assignmentKey) => {
      const moduleAssignment = state.assignments[assignmentKey];

      Object.keys(moduleAssignment).forEach((moduleAssignmentKey) => {
        const variableAssignment = state.assignments[assignmentKey][moduleAssignmentKey];
        if (variableAssignment.useBpm) {
          commit('setLfoFrequency', {
            moduleName: assignmentKey,
            controlVariable: moduleAssignmentKey,
            frequency,
          });
        }
      });
    });
  },
};

const mutations = {
  addAssignment(state, { assignment }) {
    if (!state.assignments[assignment.moduleName]) {
      __WEBPACK_IMPORTED_MODULE_1_vue__["default"].set(state.assignments, assignment.moduleName, {});
    }

    __WEBPACK_IMPORTED_MODULE_1_vue__["default"].set(state.assignments[assignment.moduleName], assignment.controlVariable, assignment);
  },
  setLfoFunction(state, { moduleName, controlVariable, expressionFunction }) {
    if (!state.assignments[moduleName][controlVariable]) return;

    __WEBPACK_IMPORTED_MODULE_1_vue__["default"].set(state.assignments[moduleName][controlVariable], 'waveform', expressionFunction);

    state.assignments[moduleName][controlVariable].controller.set({
      waveform: expressionFunction,
    });
  },
  setLfoFrequency(state, { moduleName, controlVariable, frequency }) {
    if (!state.assignments[moduleName][controlVariable]) return;

    __WEBPACK_IMPORTED_MODULE_1_vue__["default"].set(state.assignments[moduleName][controlVariable], 'freq', frequency);

    state.assignments[moduleName][controlVariable].controller.set({
      freq: frequency,
    });
  },
  setUseBpm(state, { moduleName, controlVariable, useBpm }) {
    __WEBPACK_IMPORTED_MODULE_1_vue__["default"].set(state.assignments[moduleName][controlVariable], 'useBpm', useBpm);
  },
  removeAssignment(state, { moduleName, controlVariable }) {
    __WEBPACK_IMPORTED_MODULE_1_vue__["default"].delete(state.assignments[moduleName], controlVariable);
  },
  removeAssignments(state, { moduleName }) {
    __WEBPACK_IMPORTED_MODULE_1_vue__["default"].delete(state.assignments, moduleName);
  },
  setActiveControlData(state, { moduleName, controlVariable }) {
    __WEBPACK_IMPORTED_MODULE_1_vue__["default"].set(state.activeControlData, 'moduleName', moduleName);
    __WEBPACK_IMPORTED_MODULE_1_vue__["default"].set(state.activeControlData, 'controlVariable', controlVariable);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1009:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__main__ = __webpack_require__(149);
// import EventEmitter2 from 'eventemitter2';


function generateMidiAssigner(settings) {
  const MIDIAssigner = {
    access: null,
    inputs: null,
    assignments: new Map(),
    learning: false,
    toLearn: '',
    snack: null,

    get(key) {
      this.assignments.get(key);
    },

    set(key, value) {
      this.assignments.set(key, value);
    },

    start() {
      // request MIDI access
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
          sysex: false,
        }).then((access) => {
          this.access = access;
          this.inputs = access.inputs;

          this.handleDevices(access.inputs);

          access.addEventListener('statechange', (e) => {
            this.handleDevices(e.currentTarget.inputs);
          });
        }).catch(() => {
          __WEBPACK_IMPORTED_MODULE_0__main__["default"].$dialog.alert({
            title: 'MIDI Access Refused',
            message: 'MIDI access was refused. Please check your MIDI permissions for modV and refresh the page',
            type: 'is-danger',
            hasIcon: true,
            icon: 'times-circle',
            iconPack: 'fa',
          });
        });
      } else {
        __WEBPACK_IMPORTED_MODULE_0__main__["default"].$dialog.alert({
          title: 'Outdated Browser',
          message: 'Unfortunately your browser does not support WebMIDI, please update to the latest Google Chrome release',
          type: 'is-danger',
          hasIcon: true,
          icon: 'times-circle',
          iconPack: 'fa',
        });
      }
    },

    handleDevices(inputs) {
      // loop over all available inputs and listen for any MIDI input
      for(let input of inputs.values()) { // eslint-disable-line
        // each time there is a midi message call the onMIDIMessage function
        input.removeEventListener('midimessage', this.handleInput.bind(this));
        input.addEventListener('midimessage', this.handleInput.bind(this));
      }
    },

    handleInput(message) {
      const data = message.data;
      const midiChannel = parseInt(data[1], 10);

      if (this.learning) {
        this.set(midiChannel, { variable: this.toLearn, value: null });
        __WEBPACK_IMPORTED_MODULE_0__main__["default"].$toast.open({
          message: `Learned MIDI control for ${this.toLearn.replace(',', '.')}`,
          type: 'is-success',
        });
        this.learning = false;
        this.toLearn = '';
        if (this.snack) this.snack.close();
        this.snack = null;
      }

      const assignment = this.get(midiChannel);
      if (assignment && this.messageCallback) {
        this.messageCallback({
          midiChannel,
          assignment,
          message,
        });
      }
    },

    learn(variableName) {
      this.learning = true;
      this.toLearn = variableName;

      this.snack = __WEBPACK_IMPORTED_MODULE_0__main__["default"].$snackbar.open({
        duration: 1000 * 60 * 60,
        message: `Waiting for MIDI input to learn ${variableName.replace(',', '.')}`,
        type: 'is-primary',
        position: 'is-bottom-right',
        actionText: 'Cancel',
        onAction: () => {
          this.learning = false;
          __WEBPACK_IMPORTED_MODULE_0__main__["default"].$toast.open({
            message: `MIDI learning cancelled for ${variableName.replace(',', '.')}`,
            type: 'is-info',
          });
        },
      });
    },
  };

  if (settings.get) MIDIAssigner.get = settings.get;
  if (settings.set) MIDIAssigner.set = settings.set;
  if (settings.callback) MIDIAssigner.messageCallback = settings.callback;

  console.log(settings);

  return MIDIAssigner;
}

/* harmony default export */ __webpack_exports__["a"] = (generateMidiAssigner);


/***/ }),

/***/ 1010:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);


const state = {
  devices: {},
  assignments: {},
};

// getters
const getters = {
  assignments: state => state.assignments,
  assignment: state => key => state.assignments[key],
  devices: state => state.devices,
  midiChannelFromAssignment: state => assignmentString => Object.keys(state.assignments)
    .find(channel => state.assignments[channel].variable === assignmentString),
};

// actions
const actions = {

};

// mutations
const mutations = {
  setAssignment(state, { key, value }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.assignments, key, value);
  },
  removeAssignment(state, { key }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(state.assignments, key);
  },
  removeAssignments(state, { moduleName }) {
    Object.keys(state.assignments).forEach((key) => {
      const assignment = state.assignments[key];
      const data = assignment.variable.split(',');
      if (moduleName === data[0]) {
        __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(state.assignments, key);
      }
    });
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1011:
/***/ (function(module, exports) {



/***/ }),

/***/ 1012:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = left;
function left(resizeTargetIn) {
  let resizeTarget = resizeTargetIn;
  return function attachResizeLeft(handle) {
    let allowDrag = false;
    const layersNode = document.querySelector('.active-list-wrapper');
    const galleryOuterNode = document.querySelector('.gallery-wrapper');

    window.addEventListener('mousedown', (e) => {
      if (e.which > 1) return;
      allowDrag = true;
      resizeTarget = e.target;
    });

    window.addEventListener('mouseup', () => {
      allowDrag = false;
      resizeTarget = null;
    });

    window.addEventListener('mousemove', (e) => {
      if (!allowDrag) return;
      if (resizeTarget !== handle) return;

      const percentageWidth = (e.clientX / window.innerWidth) * 100;

      galleryOuterNode.style.width = `${(100 - percentageWidth)}%`;
      layersNode.style.width = `${percentageWidth}%`;
    });
  };
}


/***/ }),

/***/ 1013:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = top;
function top(resizeTargetIn) {
  let resizeTarget = resizeTargetIn;
  return function attachResizeTop(handle, cb) {
    let allowDrag = false;
    const topNode = document.querySelector('.top');
    const bottomNode = document.querySelector('.bottom');

    window.addEventListener('mousedown', (e) => {
      if (e.which > 1) return;
      allowDrag = true;
      resizeTarget = e.target;
    });

    window.addEventListener('mouseup', () => {
      allowDrag = false;
      resizeTarget = null;

      if (cb) cb();
    });

    window.addEventListener('mousemove', (e) => {
      if (!allowDrag) return;
      if (resizeTarget !== handle) return;

      const percentageHeight = (e.clientY / window.innerHeight) * 100;

      bottomNode.style.height = `${(100 - percentageHeight)}%`;
      topNode.style.height = `${percentageHeight}%`;

      if (cb) cb();
    });
  };
}


/***/ }),

/***/ 1014:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Layer;
/**
 * @typedef {Object} Layer
 *
 * @property {String}  name                Name of the Layer
 *
 * @property {Number}  position            Position of the Layer
 *
 * @property {Array}   moduleOrder         The draw order of the Modules contained within the Layer
 *
 * @property {Boolean} enabled             Indicates whether the Layer should be drawn
 *
 * @property {Number}  alpha               The level of opacity, between 0 and 1, the Layer should
 *                                         be muxed at
 *
 * @property {Boolean} inherit             Indicates whether the Layer should inherit from another
 *                                         Layer at redraw
 *
 * @property {Number}  inheritFrom         The target Layer to inherit from, -1 being the previous
 *                                         Layer in modV#layers, 0-n being the index of
 *                                         another Layer within modV#layers
 *
 * @property {Boolean} pipeline            Indicates whether the Layer should render using pipeline
 *                                         at redraw
 *
 * @property {Boolean} clearing            Indicates whether the Layer should clear before redraw
 *
 * @property {String}  compositeOperation  The {@link Blendmode} the Layer muxes with
 *
 * @property {Boolean} drawToOutput        Indicates whether the Layer should draw to the output
 *                                         canvas
 *
 * @example
 * const Layer = {
 *   name: 'Layer',
 *
 *   position: 0,
 *
 *   moduleOrder: [
 *     'Module Name',
 *     'Another Module Name',
 *     'Waveform',
 *   ],
 *
 *   enabled: true,
 *
 *   alpha: 1,
 *
 *   inherit: true,
 *
 *   inheritFrom: -1,
 *
 *   pipeline: false,
 *
 *   clearing: false,
 *
 *   compositeOperation: 'normal',
 * };
 */

/**
 * Generates a Layer Object
 * @param {Object} options.layer Overrides for the default Layer parameters
 *
 * @returns {Layer}
 */
function Layer(layer) {
  const defaults = {
    name: 'Layer',

    position: 0,

    moduleOrder: [],

    enabled: true,

    alpha: 1,

    inherit: true,

    inheritFrom: -1,

    pipeline: false,

    clearing: false,

    compositeOperation: 'normal',

    drawToOutput: true,

    canvas: document.createElement('canvas'),

    resize({ width, height, dpr = window.devicePixelRatio }) {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
    },
  };

  defaults.context = defaults.canvas.getContext('2d');

  return Object.assign(defaults, layer);
}


/***/ }),

/***/ 1015:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_reconnecting_websocket__ = __webpack_require__(1659);



class MediaManagerClient {
  constructor() {
    this.available = false;

    let ws;

    try {
      ws = new __WEBPACK_IMPORTED_MODULE_1_reconnecting_websocket__["a" /* default */]('ws://localhost:3132/');
    } catch (e) {
      console.warn('Media Manager not connected, retrying'); //eslint-disable-line
    }

    this.ws = ws;

    ws.sendJSON = data => ws.send(JSON.stringify(data));

    ws.addEventListener('error', () => {
      this.available = false;
      console.warn('Media Manager not connected, retrying'); //eslint-disable-line
    });

    ws.addEventListener('open', () => {
      this.update();
      this.available = true;
      console.info('Media Manager connected, retrieving media list'); //eslint-disable-line
    });

    window.addEventListener('beforeunload', () => {
      ws.close({
        keepClosed: true,
      });
      this.available = false;
    });

    ws.addEventListener('message', this.messageHandler);
  }

  update() {
    this.ws.sendJSON({ request: 'update' });
  }

  send(data) {
    this.ws.sendJSON(data);
  }

  messageHandler(message) { //eslint-disable-line
    const parsed = JSON.parse(message.data);
    console.log('Media Manager says:', parsed); //eslint-disable-line

    if ('type' in parsed) {
      switch (parsed.type) {
        default:
          break;

        case 'update':
          Object.keys(parsed.payload).forEach((projectName) => {
            const project = parsed.payload[projectName];

            __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('projects/addProject', {
              projectName,
              images: project.images,
              palettes: project.palettes,
              presets: project.presets,
              videos: project.videos,
              modules: project.modules,
              plugins: project.plugins,
            });
          });
          break;

        case 'file-update-add':
          if ('data' in parsed) {
            const data = parsed.data;
            const type = data.type;
            const projectName = data.profile;
            const name = data.name;

            if (type === 'palette') {
              __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('projects/addPaletteToProject', {
                projectName,
                paletteName: name,
                colors: data.contents,
              });
            } else if (type === 'preset') {
              __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('projects/addPresetToProject', {
                projectName,
                presetName: name,
                presetData: data.contents,
              });
            } else if (type === 'module') {
              __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('projects/addModuleToProject', {
                projectName,
                presetName: name,
                path: data.path,
              });
            } else if (type === 'plugin') {
              __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('projects/addPluginToProject', {
                projectName,
                pluginName: name,
                pluginData: data.contents,
              });
            } else if (type === 'image') {
              // modV.profiles[profile].images[name] = data.path;
            } else if (type === 'video') {
              //  modV.profiles[profile].videos[name] = data.path;
            }
          }

          break;

      //   case 'profile-add':
      //     data = parsed.data;
      //     profile = data.profile;

      //     modV.profiles[profile] = {
      //       palettes: {},
      //       videos: {},
      //       images: {},
      //       presets: {}
      //     };
      //     break;

      //   case 'profile-delete':
      //     data = parsed.data;
      //     profile = data.profile;

      //     delete modV.profiles[profile];
      //     break;

      //   case 'file-update-delete':
      //     data = parsed.data;
      //     type = data.type;
      //     profile = data.profile;
      //     name = data.name;

      //     if(type === 'palette') {
      //       delete modV.profiles[profile].palettes[name];
      //     } else if(type === 'preset') {
      //       delete modV.profiles[profile].presets[name];
      //     } else if(type === 'image') {
      //       delete modV.profiles[profile].images[name];
      //     } else if(type === 'video') {
      //       delete modV.profiles[profile].videos[name];
      //     }

      //     break;
      }

      // modV.mediaSelectors.forEach(function(ms) {
      //   ms.update(modV.profiles);
      // });

      // modV.profileSelectors.forEach(function(ps) {
      //   ps.update(modV.profiles);
      // });

      // let presetSelectNode = document.querySelector('#loadPresetSelect');
      // if(!presetSelectNode) return;

      // presetSelectNode.innerHTML = '';

      // let options = [];

      // forIn(modV.profiles, (profileName, profile) => {
      //   forIn(profile.presets, (presetName, preset) => {
      //     if(presetSelectNode) {
      //       var optionNode = document.createElement('option');
      //       optionNode.value = presetName;
      //       optionNode.textContent = presetName;

      //       options.push(optionNode);
      //     }

      //     modV.presets[presetName] = preset;
      //   });
      // });

      // options.sort((a, b) => {
      //   return a.textContent.localeCompare(b.textContent);
      // });

      // options.forEach(node => {
      //   presetSelectNode.appendChild(node);
      // });
    }
  }
}

/* harmony default export */ __webpack_exports__["a"] = (MediaManagerClient);


/***/ }),

/***/ 1016:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__scan__ = __webpack_require__(1017);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__set_source__ = __webpack_require__(1018);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__scan__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_1__set_source__["a"]; });






/***/ }),

/***/ 1017:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = scanMediaStreamSources;
function scanMediaStreamSources() {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const sources = {
        audio: [],
        video: [],
      };

      devices.forEach((device) => {
        if (device.kind === 'audioinput') {
          sources.audio.push(device);
        } else if (device.kind === 'videoinput') {
          sources.video.push(device);
        }
      });

      return sources;
    }).then(resolve).catch(reject);
  });
}


/***/ }),

/***/ 1018:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_meyda__ = __webpack_require__(740);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__main__ = __webpack_require__(149);



function userMediaSuccess(stream, ids) {
  return new Promise((resolve) => {
    // Create video stream
    this.videoStream.src = window.URL.createObjectURL(stream);

    // If we have opened a previous AudioContext, destroy it as the number of AudioContexts
    // are limited to 6
    if (this.audioContext) this.audioContext.close();

    // Create new Audio Context
    this.audioContext = new window.AudioContext({
      latencyHint: 'playback',
    });

    // Create new Audio Analyser
    this.analyserNode = this.audioContext.createAnalyser();

    // Create a gain node
    this.gainNode = this.audioContext.createGain();

    // Mute the node
    this.gainNode.gain.value = 0;

    // Create the audio input stream (audio)
    this.audioStream = this.audioContext.createMediaStreamSource(stream);

    // Connect the audio stream to the analyser (this is a passthru) (audio->(analyser))
    this.audioStream.connect(this.analyserNode);

    // Connect the audio stream to the gain node (audio->(analyser)->gain)
    this.audioStream.connect(this.gainNode);

    // Connect the gain node to the output (audio->(analyser)->gain->destination)
    this.gainNode.connect(this.audioContext.destination);

    // Set up Meyda
    this.meyda = new __WEBPACK_IMPORTED_MODULE_0_meyda__["a" /* default */].createMeydaAnalyzer({ // eslint-disable-line new-cap
      audioContext: this.audioContext,
      source: this.audioStream,
      bufferSize: 512,
      windowingFunction: 'rect',
    });

    // Tell the rest of the script we're all good.
    this.mediaSourcesInited = true;

    resolve(ids);
  });
}

function userMediaError(err, reject) {
  __WEBPACK_IMPORTED_MODULE_1__main__["default"].$dialog.alert({
    title: `WebAudio ${err.name}`,
    message: 'Error gaining access to audio and video inputs - please make sure you\'ve allowed modV access.',
    type: 'is-danger',
    hasIcon: true,
    icon: 'times-circle',
    iconPack: 'fa',
  });
  if (reject) reject();
}

function setMediaSource({ audioSourceId, videoSourceId }) {
  return new Promise((resolve, reject) => {
    const constraints = {};

    if (audioSourceId) {
      constraints.audio = {
        echoCancellation: { exact: false },
        deviceId: audioSourceId,
      };
    }

    if (videoSourceId) {
      constraints.video = {
        echoCancellation: { exact: false },
        deviceId: videoSourceId,
      };
    }

    /* Ask for user media access */
    navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
      userMediaSuccess.bind(this)(mediaStream, { audioSourceId, videoSourceId })
        .then(resolve);
    }).catch((err) => {
      userMediaError(err, reject);
    });
  });
}

/* harmony default export */ __webpack_exports__["a"] = (setMediaSource);


/***/ }),

/***/ 1019:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__modv_renderers_2d__ = __webpack_require__(1024);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__modv_renderers_shader__ = __webpack_require__(600);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__modv_renderers_isf__ = __webpack_require__(599);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__mux__ = __webpack_require__(1022);







function draw(δ) {
  return new Promise((resolve) => {
    const layers = __WEBPACK_IMPORTED_MODULE_4__store__["a" /* default */].getters['layers/allLayers'];
    const audioFeatures = __WEBPACK_IMPORTED_MODULE_4__store__["a" /* default */].getters['meyda/features'];
    const previewValues = __WEBPACK_IMPORTED_MODULE_4__store__["a" /* default */].getters['size/previewValues'];

    const bufferCanvas = __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].bufferCanvas;
    const bufferContext = __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].bufferContext;

    if (!__WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].meyda) return;
    const features = __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].meyda.get(audioFeatures);

    layers.forEach((Layer, LayerIndex) => {
      let canvas = Layer.canvas;
      const context = Layer.context;

      const clearing = Layer.clearing;
      const alpha = Layer.alpha;
      const enabled = Layer.enabled;
      const inherit = Layer.inherit;
      const inheritFrom = Layer.inheritFrom;
      const pipeline = Layer.pipeline;

      if (pipeline && clearing) {
        bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      }

      if (clearing) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (inherit) {
        let lastCanvas;

        if (inheritFrom < 0) {
          if (LayerIndex - 1 > -1) {
            lastCanvas = __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].layers[LayerIndex - 1].canvas;
          } else {
            lastCanvas = __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].outputCanvas;
          }
        } else {
          lastCanvas = __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].layers[inheritFrom].canvas;
        }

        context.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);

        if (pipeline) {
          bufferContext.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);
        }
      }

      if (!enabled || alpha === 0) return;

      Layer.moduleOrder.forEach((moduleName, moduleIndex) => {
        const Module = __WEBPACK_IMPORTED_MODULE_4__store__["a" /* default */].getters['modVModules/outerActive'][moduleName];

        if (!Module) return;

        if (!Module.meta.enabled || Module.meta.alpha === 0) return;

        if (pipeline && moduleIndex !== 0) {
          canvas = bufferCanvas;
        } else if (pipeline) {
          canvas = Layer.canvas;
        }

        if (Module.meta.type === '2d') {
          if (pipeline) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
              bufferCanvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );

            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__modv_renderers_2d__["a" /* default */])({
              Module,
              canvas,
              context,
              video: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].videoStream,
              features,
              meyda: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].meyda._m, //eslint-disable-line
              delta: δ,
            });

            bufferContext.clearRect(0, 0, canvas.width, canvas.height);
            bufferContext.drawImage(
              Layer.canvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );
          } else {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__modv_renderers_2d__["a" /* default */])({
              Module,
              canvas,
              context,
              video: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].videoStream,
              features,
              meyda: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].meyda._m, //eslint-disable-line
              delta: δ,
            });
          }
        }

        if (Module.meta.type === 'shader') {
          if (pipeline) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
              bufferCanvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );

            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__modv_renderers_shader__["b" /* render */])({
              Module,
              canvas,
              context,
              video: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].videoStream,
              features,
              meyda: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].meyda,
              delta: δ,
              pipeline,
            });

            bufferContext.clearRect(0, 0, canvas.width, canvas.height);
            bufferContext.drawImage(
              Layer.canvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );
          } else {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__modv_renderers_shader__["b" /* render */])({
              Module,
              canvas,
              context,
              video: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].videoStream,
              features,
              meyda: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].meyda,
              delta: δ,
              pipeline,
            });
          }
        }

        if (Module.meta.type === 'isf') {
          if (pipeline) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
              bufferCanvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );

            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__modv_renderers_isf__["b" /* render */])({
              Module,
              canvas,
              context,
              video: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].videoStream,
              features,
              meyda: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].meyda,
              delta: δ,
              pipeline,
            });

            bufferContext.clearRect(0, 0, canvas.width, canvas.height);
            bufferContext.drawImage(
              Layer.canvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );
          } else {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__modv_renderers_isf__["b" /* render */])({
              Module,
              canvas,
              context,
              video: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].videoStream,
              features,
              meyda: __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].meyda,
              delta: δ,
              pipeline,
            });
          }
        }

        if (pipeline) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(
            bufferCanvas,
            0,
            0,
            canvas.width,
            canvas.height,
          );
        }
      });
    });

    __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].webgl.regl.poll();

    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__mux__["a" /* default */])().then(() => {
      __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].previewContext.clearRect(0, 0, __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].previewCanvas.width, __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].previewCanvas.height);
      __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].previewContext.drawImage(
        __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].outputCanvas,
        previewValues.x,
        previewValues.y,
        previewValues.width,
        previewValues.height,
      );
      resolve();
    });
  });
}

/* harmony default export */ __webpack_exports__["a"] = (draw);


/***/ }),

/***/ 1020:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store___ = __webpack_require__(16);


/**
 * Returns window area
 * @param {Window} win
 * @return {number}
 */
function getWindowSize(win) {
  return {
    area: win.innerWidth * win.innerHeight,
    width: win.innerWidth,
    height: win.innerHeight,
  };
}

/**
 * Returns Window, which area is larger
 * @param {Window} windowOne
 * @param {Window} windowTwo
 * @return {Window}
 */
function compareWindowsSize(windowOne, windowTwo) {
  const windowOneArea = getWindowSize(windowOne).area;
  const windowTwoArea = getWindowSize(windowTwo).area;

  return windowOneArea > windowTwoArea ? windowOne : windowTwo;
}

/**
 * Returns WindowController object with largest window area
 * @see modV-windowControl.js
 * @return {?WindowController}
 */
function getLargestWindow(windowControllers) {
  const windowReference = __WEBPACK_IMPORTED_MODULE_0__store___["a" /* default */].getters['windows/windowReference'];
  const windows = [];
  windowControllers.forEach((windowC) => {
    windows.push(windowReference(windowC.window));
  });

  if (windows.length === 0) {
    return null;
  }

  const reference = windows
    .reduce((accumulator, currentValue) => compareWindowsSize(accumulator, currentValue));

  const index = windows.indexOf(reference);

  return {
    window: windows[index],
    controller: windowControllers[index],
    size: getWindowSize(windows[index]),
  };
}

/* harmony default export */ __webpack_exports__["a"] = (getLargestWindow);


/***/ }),

/***/ 1021:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = installPlugin;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue__ = __webpack_require__(28);



function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

function installPlugin(plugin) {
  if (!('name' in plugin)) {
    throw new Error('Plugin requires a name');
  }

  const storeName = plugin.storeName || camelize(plugin.name);

  __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('plugins/addPlugin', {
    plugin,
  });

  if ('store' in plugin) {
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].registerModule(storeName, plugin.store);
  }

  if ('galleryTabComponent' in plugin) {
    __WEBPACK_IMPORTED_MODULE_1_vue__["default"].component(plugin.galleryTabComponent.name, plugin.galleryTabComponent);
  }

  if ('controlPanelComponent' in plugin) {
    __WEBPACK_IMPORTED_MODULE_1_vue__["default"].component(plugin.controlPanelComponent.name, plugin.controlPanelComponent);
  }

  if ('install' in plugin) {
    plugin.install(__WEBPACK_IMPORTED_MODULE_1_vue__["default"]);
  }
}


/***/ }),

/***/ 1022:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ccapture_js__ = __webpack_require__(961);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ccapture_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_ccapture_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__store__ = __webpack_require__(16);




const capturer = new __WEBPACK_IMPORTED_MODULE_1_ccapture_js___default.a({
  verbose: true,
  framerate: 60,
  // motionBlurFrames: 16,
  quality: 10,
  format: 'webm',
});

window.capturer = capturer;

function mux() {
  return new Promise((resolve) => {
    const layers = __WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */].getters['layers/allLayers'];
    const windows = __WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */].getters['windows/allWindows'];
    const width = __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].width;
    const height = __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].height;

    const outputCanvas = __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].outputCanvas;
    const outputContext = __WEBPACK_IMPORTED_MODULE_0__modv__["a" /* modV */].outputContext;

    outputContext.clearRect(0, 0, width, height);

    layers.forEach((Layer) => {
      if (!Layer.enabled || Layer.alpha === 0 || !Layer.drawToOutput) return;
      const canvas = Layer.canvas;
      outputContext.drawImage(canvas, 0, 0, width, height);
    });

    resolve();

    __WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */].getters['plugins/enabledPlugins'].filter(plugin => ('processFrame' in plugin.plugin))
      .forEach(plugin => plugin.plugin.processFrame({
        canvas: outputCanvas,
        context: outputContext,
      }),
      );

    capturer.capture(outputCanvas);

    windows.forEach((windowController) => {
      const canvas = windowController.canvas;
      const context = windowController.context;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(outputCanvas, 0, 0, canvas.width, canvas.height);
    });
  });
}

/* harmony default export */ __webpack_exports__["a"] = (mux);


/***/ }),

/***/ 1023:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_eventemitter2__ = __webpack_require__(603);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_eventemitter2___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_eventemitter2__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__store__ = __webpack_require__(16);



const PaletteWorkerScript = __webpack_require__(1763); //eslint-disable-line

/**
 * PaletteWorker
 */
class PaletteWorker extends __WEBPACK_IMPORTED_MODULE_0_eventemitter2___default.a {
  constructor() {
    super();

    /**
     * @private
     * @type {Worker}
     */
    this.worker = new PaletteWorkerScript();
    this.worker.addEventListener('message', this.messageHandler.bind(this));
  }

  /**
   * @protected
   * @param {MessageEvent} evt
   */
  messageHandler(evt) {
    switch (evt.data.message) {
      default:
      case undefined:
        break;
      case 'palette-create':
        this.emit(PaletteWorker.EventType.PALETTE_ADDED, {
          id: evt.data.paletteId,
        });
        break;
      case 'palette-update':
        __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('palettes/stepUpdate', {
          id: evt.data.paletteId,
          currentStep: evt.data.currentStep,
          currentColor: evt.data.currentColor,
        });

        __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/updateProp', {
          name: __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].state.palettes.palettes[evt.data.paletteId].moduleName,
          prop: __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].state.palettes.palettes[evt.data.paletteId].variable,
          data: evt.data.currentStep,
        });

        break;
    }
  }

  /**
   * @param {string} id
   * @todo Add necessary params
   */
  createPalette(id, colors, duration) {
    this.worker.postMessage({
      message: 'create-palette',
      paletteId: id,
      colors,
      duration,
    });
  }

  /**
   * @params {string} id
   * @params {Object} options
   * @todo Type of options
   */
  setPalette(id, options) {
    this.worker.postMessage({
      message: 'set-palette',
      paletteId: id,
      options,
    });
  }

  /** @param {string} id */
  removePalette(id) {
    this.worker.postMessage({
      message: 'remove-palette',
      paletteId: id,
    });
  }
}

/** @enum {string} */
PaletteWorker.EventType = {
  PALETTE_ADDED: 'palette_added',
  PALETTE_UPDATED: 'palette_updated',
};

/* harmony default export */ __webpack_exports__["a"] = (PaletteWorker);


/***/ }),

/***/ 1024:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = render2d;
const twoDCanvas = document.createElement('canvas');
const twoDContext = twoDCanvas.getContext('2d');

/**
 * Called each frame to update the Module
 * @param  {Object}                   Module        A 2D Module
 * @param  {HTMLCanvas}               canvas        The Canvas to draw to
 * @param  {CanvasRenderingContext2D} context       The Context of the Canvas
 * @param  {HTMLVideoElement}         video         The video stream requested by modV
 * @param  {Array<MeydaFeatures>}     meydaFeatures Requested Meyda features
 * @param  {Meyda}                    meyda         The Meyda instance
 *                                                  (for Windowing functions etc.)
 *
 * @param  {DOMHighResTimeStamp}      delta         Timestamp returned by requestAnimationFrame
 * @param  {Number}                   bpm           The detected or tapped BPM
 * @param  {Boolean}                  kick          Indicates if BeatDetektor detected a kick in
 *                                                  the audio stream
 */
function render2d({
  Module,
  canvas,
  context,
  video,
  features,
  meyda,
  delta,
  bpm,
  kick,
}) {
  twoDCanvas.width = canvas.width;
  twoDCanvas.height = canvas.height;
  twoDContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);

  twoDContext.save();
  Module.draw({
    canvas: twoDCanvas,
    context: twoDContext,
    video,
    features,
    meyda,
    delta,
    bpm,
    kick,
  });
  twoDContext.restore();

  context.save();
  context.globalAlpha = Module.meta.alpha || 1;
  context.globalCompositeOperation = Module.meta.compositeOperation || 'normal';
  context.drawImage(twoDCanvas, 0, 0, canvas.width, canvas.height);
  context.restore();
}


/***/ }),

/***/ 1025:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = textureResolve;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);


function textureResolve(sourceDef) {
  const { source, sourceData } = sourceDef;

  switch (source) {
    case 'layer': {
      if (sourceData < 0) return false;
      return __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.layers.layers[sourceData].canvas;
    }

    case 'image': {
      return false;
    }

    case 'video': {
      return false;
    }

    default: {
      return false;
    }
  }
}


/***/ }),

/***/ 1026:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
  v: `
    precision mediump float;

    attribute vec2 position, a_position, a_texCoord;

    varying vec2 vUv;
    varying vec2 fragCoord;

    void main() {
      vUv = vec2(1.0 - position.x, position.y);
      fragCoord = vec2(1.0 - position.x, position.y);
      gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
    }`,

  f: `
    precision mediump float;

    uniform vec3      iResolution;           // viewport resolution (in pixels)
    uniform float     iGlobalTime;           // shader playback time (in seconds)
    uniform float     iTimeDelta;            // render time (in seconds)
    uniform float     iTime;                 // render time (in seconds)
    uniform int       iFrame;                // shader playback frame
    uniform float     iChannelTime[4];       // channel playback time (in seconds)
    uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
    uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
    uniform vec4      iDate;                 // (year, month, day, time in seconds)
    uniform sampler2D iChannel0;             // Texture #1
    uniform sampler2D iChannel1;             // Texture #2
    uniform sampler2D iChannel2;             // Texture #3
    uniform sampler2D iChannel3;             // Texture #4
    uniform sampler2D u_modVCanvas;          // modV's canvas

    varying vec2 vUv;

    void main() {
      gl_FragColor=vec4(vUv.x,0.5+0.5*cos(iGlobalTime/1.1),0.5+0.5*sin(iGlobalTime),1.0);
    }`,

  v300: `#version 300 es
    precision mediump float;
    in vec2 position;
    uniform vec3 iResolution;
    uniform float iTime;
    out vec2 vUv;
    void main() {
      vUv = vec2(1.0 - position.x, position.y);
      gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
    }`,

  fWrap: `#version 300 es
    precision mediump float;
    uniform vec3      iResolution;           // viewport resolution (in pixels)
    uniform float     iGlobalTime;           // shader playback time (in seconds)
    uniform float     iTimeDelta;            // render time (in seconds)
    uniform float     iTime;                 // render time (in seconds)
    uniform int       iFrame;                // shader playback frame
    uniform float     iChannelTime[4];       // channel playback time (in seconds)
    uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
    uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
    uniform vec4      iDate;                 // (year, month, day, time in seconds)
    uniform sampler2D iChannel0;             // Texture #1
    uniform sampler2D iChannel1;             // Texture #2
    uniform sampler2D iChannel2;             // Texture #3
    uniform sampler2D iChannel3;             // Texture #4
    uniform sampler2D u_modVCanvas;          // modV's canvas

    in vec2 vUv;
    out vec4 outColor;

    %MAIN_IMAGE_INJECT%
    void main() {
      vec4 image;
      mainImage(image, gl_FragCoord.xy);
      image.a = 1.;
      outColor = image;
    }`,
});


/***/ }),

/***/ 1027:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_regl_dist_regl_unchecked__ = __webpack_require__(1662);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_regl_dist_regl_unchecked___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_regl_dist_regl_unchecked__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__default_shader__ = __webpack_require__(1026);



function setupWebGl(modV) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', {
    premultipliedAlpha: false,
    antialias: true,
  });

  const regl = __WEBPACK_IMPORTED_MODULE_0_regl_dist_regl_unchecked___default()({
    gl,
    attributes: {
      antialias: true,
    },
  });

  const env = { gl, canvas, regl };

  Object.defineProperty(env, 'defaultShader', {
    get: () => __WEBPACK_IMPORTED_MODULE_1__default_shader__["a" /* default */],
  });

  modV.webgl = env;

  env.resize = (widthIn, heightIn, dpr = 1) => {
    const width = widthIn * dpr;
    const height = heightIn * dpr;

    canvas.width = width;
    canvas.height = height;
  };

  env.resize(modV.width, modV.height);

  return env;
}

/* harmony default export */ __webpack_exports__["a"] = (setupWebGl);


/***/ }),

/***/ 1028:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__modv__ = __webpack_require__(21);



class WindowController {
  constructor(Vue) {
    return new Promise((resolve) => {
      if (window.nw) {
        if (window.nw.open) {
          window.nw.Window.open('output.html', (newWindow) => {
            this.window = newWindow.window;
            if (this.window.document.readyState === 'complete') {
              this.configureWindow(resolve);
            } else {
              this.window.onload = () => {
                this.configureWindow(resolve);
              };
            }
          });
        } else {
          this.window = window.open(
            '',
            '_blank',
            'width=250, height=250, location=no, menubar=no, left=0',
          );

          if (this.window === null || typeof this.window === 'undefined') {
            Vue.$dialog.alert({
              title: 'Could not create Output Window',
              message: 'modV couldn\'t open an Output Window. Please check you\'ve allowed pop-ups - then reload',
              type: 'is-danger',
              hasIcon: true,
              icon: 'times-circle',
              iconPack: 'fa',
            });
            return;
          }

          if (this.window.document.readyState === 'complete') {
            this.configureWindow(resolve);
          } else {
            this.window.onload = () => {
              this.configureWindow(resolve);
            };
          }
        }
      }
    });
  }


  configureWindow(callback) {
    const windowRef = this.window;
    windowRef.document.title = 'modV Output';
    windowRef.document.body.style.margin = '0px';
    windowRef.document.body.style.backgroundColor = 'black';
    windowRef.document.body.style.position = 'relative';

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.style.backgroundColor = 'transparent';
    this.canvas.style.left = '50%';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '50%';
    this.canvas.style.transform = 'translate(-50%, -50%)';

    this.canvas.addEventListener('dblclick', () => {
      if (!this.canvas.ownerDocument.webkitFullscreenElement) {
        this.canvas.webkitRequestFullscreen();
      } else {
        this.canvas.ownerDocument.webkitExitFullscreen();
      }
    });

    let mouseTimer;

    function movedMouse() {
      if (mouseTimer) mouseTimer = null;
      this.canvas.ownerDocument.body.style.cursor = 'none';
    }

    this.canvas.addEventListener('mousemove', () => {
      if (mouseTimer) clearTimeout(mouseTimer);
      this.canvas.ownerDocument.body.style.cursor = 'default';
      mouseTimer = setTimeout(movedMouse.bind(this), 200);
    });

    this.window.document.body.appendChild(this.canvas);

    let resizeQueue = {};
    let lastArea = 0;
    // Roughly attach to the main RAF loop for smoother resizing
    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].on('tick', () => {
      if (lastArea < 1) return;

      if ((resizeQueue.width * resizeQueue.height) + resizeQueue.dpr !== lastArea) {
        lastArea = (resizeQueue.width * resizeQueue.height) + resizeQueue.dpr;
        return;
      }

      const width = resizeQueue.width;
      const height = resizeQueue.height;
      const dpr = resizeQueue.dpr;
      const emit = resizeQueue.emit;

      if (emit) {
        __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('size/setDimensions', { width, height });
      }

      this.canvas.width = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.size.width || width * dpr;
      this.canvas.height = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.size.height || height * dpr;
      this.canvas.style.width = `${__WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.size.width}px`;
      this.canvas.style.height = `${__WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.size.height}px`;

      lastArea = 0;
    });

    this.resize = (width, height, dpr = 1, emit = true) => {
      resizeQueue = {
        width,
        height,
        dpr,
        emit,
      };
      lastArea = 1;
    };

    windowRef.addEventListener('resize', () => {
      let dpr = windowRef.devicePixelRatio;

      if (!__WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['user/useRetina']) {
        dpr = 1;
      }

      this.resize(windowRef.innerWidth, windowRef.innerHeight, dpr);
    });
    windowRef.addEventListener('beforeunload', () => 'You sure about that, you drunken mess?');
    windowRef.addEventListener('unload', () => {
      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('windows/destroyWindow', { windowRef: this.window });
    });

    if (callback) callback(this);
  }
}

/* harmony default export */ __webpack_exports__["a"] = (WindowController);


/***/ }),

/***/ 1029:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const state = {
  pinnedPanels: [],
};

// getters
const getters = {
  pinnedPanels: state => state.pinnedPanels,
};

// actions
const actions = {

};

// mutations
const mutations = {
  pinPanel(state, { moduleName }) {
    state.pinnedPanels.push(moduleName);
  },
  unpinPanel(state, { moduleName }) {
    state.pinnedPanels.splice(state.pinnedPanels.indexOf(moduleName), 1);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1030:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_get_next_name__ = __webpack_require__(602);





const state = {
  focusedLayer: 0,
  layers: [],
};

// getters
const getters = {
  allLayers: state => state.layers,
  focusedLayerIndex: state => state.focusedLayer,
  focusedLayer: state => state.layers[state.focusedLayer],
  layerFromModuleName: state => ({ moduleName }) => {
    const layerIndex = state.layers.findIndex(layer => layer.moduleOrder.indexOf(moduleName) > -1);

    if (layerIndex < 0) return false;

    return {
      layer: state.layers[layerIndex],
      layerIndex,
    };
  },
};

// actions
const actions = {
  addLayer({ commit, state }) {
    return new Promise(async (resolve) => {
      const layerName = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__utils_get_next_name__["a" /* default */])(
        'Layer',
        state.layers.map(layer => layer.name),
      );

      const layer = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__modv__["d" /* Layer */])({
        name: layerName,
      });

      const width = __WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */].getters['size/width'];
      const height = __WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */].getters['size/height'];
      let dpr = 1;
      if (__WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */].getters['user/useRetina']) {
        dpr = window.devicePixelRatio;
      }

      layer.resize({ width, height, dpr });
      commit('addLayer', { layer });
      commit('setLayerFocus', {
        LayerIndex: state.layers.length - 1,
      });

      resolve({
        Layer: layer,
        index: state.layers.length - 1,
      });
    });
  },
  removeFocusedLayer({ commit, state }) {
    const Layer = state.layers[state.focusedLayer];
    Layer.moduleOrder.forEach((moduleName) => {
      __WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */].dispatch(
        'modVModules/removeActiveModule',
        { moduleName },
      );
    });
    commit('removeLayer', { layerIndex: state.focusedLayer });
    if (state.focusedLayer > 0) commit('setLayerFocus', { LayerIndex: state.focusedLayer - 1 });
  },
  toggleLocked({ commit, state }, { layerIndex }) {
    const Layer = state.layers[layerIndex];

    if (Layer.locked) commit('unlock', { layerIndex });
    else commit('lock', { layerIndex });
  },
  toggleCollapsed({ commit, state }, { layerIndex }) {
    const Layer = state.layers[layerIndex];

    if (Layer.collapsed) commit('uncollapse', { layerIndex });
    else commit('collapse', { layerIndex });
  },
  addModuleToLayer({ commit }, { module, layerIndex, position }) {
    let positionShadow = position;
    if (typeof positionShadow !== 'number') {
      if (positionShadow < 0) {
        positionShadow = 0;
      }
    }
    commit('addModuleToLayer', {
      moduleName: module.meta.name,
      position: positionShadow,
      layerIndex,
    });

    __WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */].commit(
      'modVModules/setModuleFocus',
      { activeModuleName: module.meta.name },
      { root: true },
    );
  },
  updateModuleOrder({ commit }, { layerIndex, order }) {
    commit('updateModuleOrder', { layerIndex, order });
  },
  resize({ state }, { width, height, dpr }) {
    state.layers.forEach((Layer) => {
      Layer.resize({ width, height, dpr });
    });
  },
  removeAllLayers({ commit, state }) {
    state.layers.forEach((Layer, layerIndex) => {
      Layer.moduleOrder.forEach((moduleName) => {
        __WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */].dispatch(
          'modVModules/removeActiveModule',
          { moduleName },
        );
      });

      commit('removeLayer', { layerIndex });
    });
  },
  presetData({ state }) {
    return state.layers.map((Layer) => {
      const layerData = {};
      layerData.alpha = Layer.alpha;
      layerData.blending = Layer.blending;
      layerData.clearing = Layer.clearing;
      layerData.collapsed = Layer.collapsed;
      layerData.drawToOutput = Layer.drawToOutput;
      layerData.enabled = Layer.enabled;
      layerData.inherit = Layer.inherit;
      layerData.inheritFrom = Layer.inheritFrom;
      layerData.locked = Layer.locked;
      layerData.moduleOrder = Layer.moduleOrder;
      layerData.name = Layer.name;
      layerData.pipeline = Layer.pipeline;
      return layerData;
    });
  },
  async setLayerName({ state, commit }, { layerIndex, name }) {
    const layerName = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__utils_get_next_name__["a" /* default */])(
      name,
      state.layers.map(layer => layer.name),
    );

    commit('setLayerName', { LayerIndex: layerIndex, name: layerName });
  },
};

// mutations
const mutations = {
  addModuleToLayer(state, { moduleName, layerIndex, position }) {
    const Layer = state.layers[layerIndex];
    if (Layer.locked) return;

    if (!Layer) {
      throw `Cannot find Layer with index ${layerIndex}`; //eslint-disable-line
    } else {
      Layer.moduleOrder.splice(position, 0, moduleName);
    }
  },
  removeModuleFromLayer(state, { moduleName, layerIndex }) {
    const Layer = state.layers[layerIndex];

    const moduleIndex = Layer.moduleOrder.indexOf(moduleName);
    if (moduleIndex < 0) return;

    Layer.moduleOrder.splice(moduleIndex, 1);
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(Layer.modules, moduleName);
  },
  addLayer(state, { layer }) {
    state.layers.push(layer);
  },
  removeLayer(state, { layerIndex }) {
    state.layers.splice(layerIndex, 1);
  },
  setLayerName(state, { LayerIndex, name }) {
    state.layers[LayerIndex].name = name;
  },
  setLayerFocus(state, { LayerIndex }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state, 'focusedLayer', LayerIndex);
  },
  lock(state, { layerIndex }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'locked', true);
  },
  unlock(state, { layerIndex }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'locked', false);
  },
  setLocked(state, { layerIndex, locked }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'locked', locked);
  },
  collapse(state, { layerIndex }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'collapsed', true);
  },
  uncollapse(state, { layerIndex }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'collapsed', false);
  },
  setCollapsed(state, { layerIndex, collapsed }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'collapsed', collapsed);
  },
  updateLayers(state, { layers }) {
    state.layers = layers;
  },
  updateModuleOrder(state, { layerIndex, order }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'moduleOrder', order);
  },
  setClearing(state, { layerIndex, clearing }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'clearing', clearing);
  },
  setAlpha(state, { layerIndex, alpha }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'alpha', alpha);
  },
  setEnabled(state, { layerIndex, enabled }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'enabled', enabled);
  },
  setInherit(state, { layerIndex, inherit }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'inherit', inherit);
  },
  setInheritFrom(state, { layerIndex, inheritFrom }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'inheritFrom', inheritFrom);
  },
  setPipeline(state, { layerIndex, pipeline }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'pipeline', pipeline);
  },
  setBlending(state, { layerIndex, blending }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'blending', blending);
  },
  setDrawToOutput(state, { layerIndex, drawToOutput }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'drawToOutput', drawToOutput);
  },
  setModuleOrder(state, { layerIndex, moduleOrder }) {
    const Layer = state.layers[layerIndex];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(Layer, 'moduleOrder', moduleOrder);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1031:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const state = {
  audio: [],
  video: [],
};

// getters
const getters = {
  audioSources: state => state.audio,
  videoSources: state => state.video,
};

// actions
const actions = {

};

// mutations
const mutations = {
  addAudioSource(state, { source }) {
    state.audio.push(source);
  },
  addVideoSource(state, { source }) {
    state.video.push(source);
  },
  clearAudioSources(state) {
    state.audio = [];
  },
  clearVideoSources(state) {
    state.video = [];
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1032:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(16);


const state = {
  features: ['complexSpectrum'],
  controlAssignments: [],
};

// getters
const getters = {
  features: state => state.features,
  controlAssignments: state => state.controlAssignments,
  assignment: state => (moduleName) => {
    const assignmentsToModule = state.controlAssignments
      .filter(assignment => assignment.moduleName === moduleName);

    if (assignmentsToModule.length === 0) return false;
    return assignmentsToModule;
  },
};

// actions
const actions = {

};

// mutations
const mutations = {
  addFeature(state, { feature }) {
    if (state.features.find(element => element === feature)) return;
    state.features.push(feature);
  },
  removeFeature(state, { feature }) {
    const index = state.features.findIndex(element => element === feature);
    if (index < 0) return;
    state.features.splice(index, 1);
  },
  assignFeatureToControl(state, { feature, moduleName, controlVariable }) {
    const Module = __WEBPACK_IMPORTED_MODULE_0__index__["a" /* default */].state.modVModules.active[moduleName];
    if (!Module) return;
    if (typeof Module.props[controlVariable] === 'undefined') return;

    const assignment = {
      feature,
      moduleName,
      controlVariable,
    };

    if (state.features.indexOf(feature) < 0) state.features.push(feature);
    state.controlAssignments.push(assignment);
  },
  removeAssignments(state, { moduleName }) {
    state.controlAssignments = state.controlAssignments
      .filter(assignment => assignment.moduleName !== moduleName);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1033:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ajv_lib_ajv__ = __webpack_require__(861);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ajv_lib_ajv___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_ajv_lib_ajv__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_lodash_clonedeep__ = __webpack_require__(1238);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_lodash_clonedeep___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_lodash_clonedeep__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_get_next_name__ = __webpack_require__(602);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__modv_renderers_shader__ = __webpack_require__(600);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__modv_renderers_isf__ = __webpack_require__(599);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__modv_texture_resolve__ = __webpack_require__(1025);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__index__ = __webpack_require__(16);










const jsd4 = __webpack_require__(890);

const makeSchema = function makeSchema(properties) {
  return {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    properties,
  };
};

const outerState = {
  registry: {},
  active: {},
};

window.outerState = outerState;

const state = {
  registry: {},
  active: {},
  activePropQueue: {},
  activeMetaQueue: {},
  focusedModule: null,
  currentDragged: null,
};

// getters
const getters = {
  // registry: state => state.registry,
  // activeModules: state => state.active,
  focusedModule: state => outerState.active[state.focusedModule],
  focusedModuleName: state => state.focusedModule,
  // getActiveModule: () => moduleName => externalState.active[moduleName],
  currentDragged: state => state.currentDragged,
  // getValueFromActiveModule: state => (moduleName, controlVariable) => {
  //   const module = externalState.active[moduleName];
  //   let processed = externalState.active[moduleName][controlVariable];

  //   if ('append' in module.info.controls[controlVariable]) {
  //     processed = processed.replace(module.info.controls[controlVariable].append, '');
  //   }

  //   return {
  //     raw: state.active[moduleName][controlVariable],
  //     processed,
  //   };
  // },
  registry: state => state.registry,
  active: state => state.active,
  outerRegistry: () => outerState.registry,
  outerActive: () => outerState.active,
};

// actions
const actions = {
  register({ commit }, data) {
    commit('addModuleToRegistry', { name: data.meta.name, data });
  },

  async createActiveModule({ commit, state }, { moduleName, appendToName, skipInit, enabled }) {
    return new Promise(async (resolve) => {
      const existingModuleData = outerState.registry[moduleName];
      if (!existingModuleData) return;

      let newModuleData = __WEBPACK_IMPORTED_MODULE_3_lodash_clonedeep___default()(existingModuleData);

      switch (newModuleData.meta.type) {
        case 'shader':
          newModuleData = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__modv_renderers_shader__["a" /* setup */])(newModuleData);
          break;

        case 'isf':
          newModuleData = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__modv_renderers_isf__["a" /* setup */])(newModuleData);
          break;

        default:
          break;
      }

      newModuleData.meta.originalName = newModuleData.meta.name;
      newModuleData.meta.name = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__utils_get_next_name__["a" /* default */])(
        `${newModuleData.meta.name}${appendToName || ''}`,
        Object.keys(state.active),
      );
      newModuleData.meta.alpha = 1;
      newModuleData.meta.enabled = enabled || false;
      newModuleData.meta.compositeOperation = 'normal';

      const { data, props, meta, presets } = newModuleData;

      if (data) {
        Object.keys(data).forEach((key) => {
          const value = data[key];
          newModuleData[key] = value;
        });
      }

      if (props) {
        Object.keys(props).forEach((key) => {
          const value = props[key];

          if (typeof value.default !== 'undefined') {
            newModuleData[key] = value.default;
          }

          if (value.type === 'group') {
            newModuleData[key] = {};

            newModuleData[key].length = value.default > -1 ? value.default : 1;
            newModuleData[key].props = {};

            Object.keys(value.props).forEach((groupProp) => {
              const groupValue = value.props[groupProp];
              newModuleData[key].props[groupProp] = [];

              if (value.default && typeof groupValue.default !== 'undefined') {
                for (let i = 0; i < value.default; i += 1) {
                  newModuleData[key].props[groupProp][i] = groupValue.default;
                }
              }
            });
          }

          if (value.control) {
            if (value.control.type === 'paletteControl') {
              const { options } = value.control;

              __WEBPACK_IMPORTED_MODULE_8__index__["a" /* default */].dispatch('palettes/createPalette', {
                id: `${meta.name}-${key}`,
                colors: options.colors || [],
                duration: options.duration,
                returnFormat: options.returnFormat,
                moduleName: meta.name,
                variable: key,
              });
            }
          }
        });
      }

      if (presets) {
        newModuleData.presets = {};

        Object.keys(presets).forEach((key) => {
          const value = presets[key];
          newModuleData.presets[key] = value;
        });
      }

      commit('addModuleToActive', { name: newModuleData.meta.name, data: newModuleData });

      const canvas = __WEBPACK_IMPORTED_MODULE_2__modv__["a" /* modV */].bufferCanvas;

      if ('audioFeatures' in newModuleData.meta) {
        if (Array.isArray(newModuleData.meta.audioFeatures)) {
          newModuleData.meta.audioFeatures.forEach(feature =>
            __WEBPACK_IMPORTED_MODULE_8__index__["a" /* default */].commit('meyda/addFeature', { feature }),
          );
        }
      }

      if ('init' in newModuleData && !skipInit) {
        newModuleData.init({ canvas });
      }

      if ('resize' in newModuleData && !skipInit) {
        newModuleData.resize({ canvas });
      }

      resolve(outerState.active[newModuleData.meta.name]);
    });
  },

  async removeActiveModule({ state, commit }, { moduleName }) {
    __WEBPACK_IMPORTED_MODULE_8__index__["a" /* default */].commit('controlPanels/unpinPanel', { moduleName });

    if (state.focusedModule === moduleName) {
      commit('setModuleFocus', { activeModuleName: null });
    }

    const module = state.active[moduleName];

    const { props, meta } = module;

    if (props) {
      Object.keys(props).forEach(async (key) => {
        const value = props[key];

        if (value.control && value.control.type === 'paletteControl') {
          await __WEBPACK_IMPORTED_MODULE_8__index__["a" /* default */].dispatch('palettes/removePalette', {
            id: `${meta.name}-${key}`,
          });
        }
      });
    }

    // if ('controls' in Module.info) {
    //   Object.keys(Module.info.controls).forEach((key) => {
    //     const control = Module.info.controls[key];
    //     const inputId = `${moduleName}-${control.variable}`;

    //     if (control.type === 'paletteControl') {
    //       store.dispatch('palettes/removePalette', {
    //         id: inputId,
    //       });
    //     }
    //   });
    // }

    /* Remove active module from Layers */
    const layer = __WEBPACK_IMPORTED_MODULE_8__index__["a" /* default */].getters['layers/layerFromModuleName']({ moduleName });
    if (layer) {
      const moduleOrder = layer.layer.moduleOrder;
      moduleOrder.splice(moduleOrder.indexOf(moduleName), 1);

      await __WEBPACK_IMPORTED_MODULE_8__index__["a" /* default */].dispatch('layers/updateModuleOrder', {
        layerIndex: layer.layerIndex,
        order: moduleOrder,
      });
    }

    commit('removeActiveModule', { moduleName });
  },

  resizeActive({ state }) {
    const canvas = __WEBPACK_IMPORTED_MODULE_2__modv__["a" /* modV */].bufferCanvas;
    Object.keys(state.active).forEach((moduleName) => {
      let module;

      if (moduleName.indexOf('-gallery') > -1) return;

      if (moduleName in outerState.active) {
        module = outerState.active[moduleName];
      } else {
        return;
      }

      if ('resize' in module) {
        module.resize({ canvas });
      }
    });
  },

  updateProp({ state, commit }, { name, prop, data, group, groupName }) {
    let propData = state.active[name].props[prop];
    const currentValue = state.active[name][prop];

    if (group || groupName) {
      propData = state.active[name].props[groupName].props[prop];
    }

    if (data === currentValue) return;

    let dataOut = data;

    __WEBPACK_IMPORTED_MODULE_8__index__["a" /* default */].getters['plugins/enabledPlugins']
      .filter(plugin => ('processValue' in plugin.plugin))
      .forEach((plugin) => {
        const newValue = plugin.plugin.processValue({
          currentValue: data,
          controlVariable: prop,
          delta: __WEBPACK_IMPORTED_MODULE_2__modv__["a" /* modV */].delta,
          moduleName: name,
        });

        if (typeof newValue !== 'undefined') dataOut = newValue;
      });

    if (!Array.isArray(dataOut)) {
      const {
        strict,
        min,
        max,
        abs,
        type,
      } = propData;

      if (
        strict &&
        typeof min !== 'undefined' &&
        typeof max !== 'undefined'
      ) {
        dataOut = Math.min(Math.max(dataOut, min), max);
      }

      if (abs) {
        dataOut = Math.abs(dataOut);
      }

      if (type === 'int') {
        dataOut = Math.round(dataOut);
      }
    }

    commit('queuePropUpdate', {
      name,
      prop,
      data: {
        value: dataOut,
        type: propData.type,
        group,
        groupName,
      },
    });
  },

  syncPropQueue({ state, commit }) {
    const moduleKeys = Object.keys(state.activePropQueue);

    for (let i = 0; i < moduleKeys.length; i += 1) {
      const moduleKey = moduleKeys[i];
      const moduleProps = state.activePropQueue[moduleKey];

      const propsKeys = Object.keys(moduleProps);

      for (let j = 0; j < moduleKeys.length; j += 1) {
        const key = propsKeys[j];

        if (
          typeof moduleProps[key] === 'undefined' ||
          typeof key === 'undefined'
        ) {
          /* eslint-disable no-continue */
          continue;
        }

        if (!outerState.active[moduleKey]) continue;

        const { group, groupName } = moduleProps[key];

        if (group || groupName) {
          if ('set' in outerState.active[moduleKey].props[groupName].props[key]) {
            outerState
              .active[moduleKey].props[groupName].props[key]
              .set.bind(outerState.active[moduleKey])(moduleProps[key].value);
          }
        } else if ('set' in outerState.active[moduleKey].props[key]) {
          outerState
            .active[moduleKey]
            .props[key].set.bind(outerState.active[moduleKey])(moduleProps[key].value);
        }

        commit('updateProp', {
          name: moduleKey,
          prop: key,
          data: moduleProps[key],
          group,
          groupName,
        });
      }
    }
  },

  updateMeta({ commit }, args) {
    commit('queueMetaUpdate', args);
  },

  syncMetaQueue({ state, commit }) {
    const moduleKeys = Object.keys(state.activeMetaQueue);

    for (let i = 0; i < moduleKeys.length; i += 1) {
      const moduleKey = moduleKeys[i];
      const moduleMetaValues = state.activeMetaQueue[moduleKey];

      const metaKeys = Object.keys(moduleMetaValues);

      for (let j = 0; j < moduleKeys.length; j += 1) {
        const key = metaKeys[j];
        if (
          typeof moduleMetaValues[key] === 'undefined' ||
          typeof key === 'undefined'
        ) {
          /* eslint-disable no-continue */
          continue;
        }

        commit('updateMeta', {
          name: moduleKey,
          metaKey: key,
          data: moduleMetaValues[key],
        });
      }
    }
  },

  syncQueues({ dispatch }) {
    dispatch('syncPropQueue');
    dispatch('syncMetaQueue');
  },

  resetModule({ dispatch }, { name }) {
    Object.keys(outerState.registry[name].props).forEach((key) => {
      const prop = outerState.registry[name].props[key];

      dispatch('updateProp', {
        name,
        prop: key,
        data: prop.default,
      });
    });
  },

  presetData({ state }) {
    // @TODO: figure out a better clone than JSONparse(JSONstringify())
    const ajv = new __WEBPACK_IMPORTED_MODULE_1_ajv_lib_ajv___default.a({
      removeAdditional: 'all',
    });
    ajv.addMetaSchema(jsd4);

    const moduleNames = Object.keys(state.active)
      .filter(key => key.substring(key.length - 8, key.length) !== '-gallery');

    const moduleData = moduleNames.reduce((obj, moduleName) => {
      obj[moduleName] = {};
      obj[moduleName].values = Object.keys(state.active[moduleName].props)
        .reduce((valuesObj, prop) => {
          valuesObj[prop] = state.active[moduleName][prop];
          return valuesObj;
        }, {});
      return obj;
    }, {});

    moduleNames.forEach((moduleName) => {
      const Module = outerState.active[moduleName];

      // Merge Module data onto existing data
      moduleData[moduleName].meta = {};
      moduleData[moduleName].meta = Object.assign(Module.meta, moduleData[moduleName].meta);

      if (!('saveData' in Module.meta)) {
        console.warn(
          `generatePreset: Module ${Module.meta.name} has no saveData schema, falling back to Vuex store data`,
        );
        return;
      }

      const schema = makeSchema(JSON.parse(JSON.stringify(Module.meta.saveData)));
      const validate = ajv.compile(schema);

      const copiedModule = JSON.parse(JSON.stringify(Module));
      const validated = validate(copiedModule);
      if (!validated) {
        console.error(
          `generatePreset: Module ${Module.meta.name} failed saveData validation, skipping`,
          validate.errors,
        );
        return;
      }

      // Merge validated data onto existing data
      moduleData[moduleName].values = Object.assign(moduleData[moduleName].values, copiedModule);
    });

    return moduleData;
  },

  setActiveModuleInfo({ commit }, { moduleName, key, value }) {
    commit('setActiveModuleInfo', { moduleName, key, value });
  },
};

// mutations
const mutations = {
  addModuleToRegistry(state, { name, data }) {
    outerState.registry[name] = data;
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.registry, name, data);
  },

  addModuleToActive(state, { name, data }) {
    outerState.active[name] = data;
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active, name, JSON.parse(JSON.stringify(data)));
  },

  removeModuleFromRegistry(state, { moduleName }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(state.registry, moduleName);
  },

  queuePropUpdate(state, { name, prop, data }) {
    if (typeof state.activePropQueue[name] === 'undefined') {
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.activePropQueue, name, {});
    }

    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.activePropQueue[name], prop, data);
  },

  updateProp(state, { name, prop, data, group, groupName }) {
    let value;

    if (data.type === 'texture') {
      value = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__modv_texture_resolve__["a" /* default */])(data.value);
    } else {
      value = data.value;
    }

    if (typeof group === 'number') {
      outerState.active[name][groupName].props[prop][group] = value;
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active[name][groupName].props[prop], group, value);
    } else {
      outerState.active[name][prop] = value;
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active[name], prop, value);
    }

    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(state.activePropQueue[name], prop);
  },

  queueMetaUpdate(state, { name, metaKey, data }) {
    if (typeof state.activeMetaQueue[name] === 'undefined') {
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.activeMetaQueue, name, {});
    }

    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.activeMetaQueue[name], metaKey, data);
  },

  updateMeta(state, { name, metaKey, data }) {
    outerState.active[name].meta[metaKey] = data;
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active[name].meta, metaKey, data);
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(state.activeMetaQueue[name], metaKey);
  },

  // setActiveModuleControlValue(state, { moduleName, variable, value, processedValue }) {
  //   Vue.set(state.active[moduleName], variable, value);
  //   externalState.active[moduleName][variable] = processedValue || value;
  // },

  removeActiveModule(state, { moduleName }) {
    delete outerState.active[moduleName];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(state.active, moduleName);
  },

  setModuleFocus(state, { activeModuleName }) {
    state.focusedModule = activeModuleName;
  },

  setCurrentDragged(state, { moduleName }) {
    state.currentDragged = moduleName;
  },

  setActiveModuleAlpha(state, { moduleName, alpha }) {
    outerState.active[moduleName].meta.alpha = alpha;
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active[moduleName].meta, 'alpha', alpha);
  },

  setActiveModuleEnabled(state, { moduleName, enabled }) {
    outerState.active[moduleName].meta.enabled = enabled;
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active[moduleName].meta, 'enabled', enabled);
  },

  setActiveModuleCompositeOperation(state, { moduleName, compositeOperation }) {
    outerState.active[moduleName].meta.compositeOperation = compositeOperation;
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active[moduleName].meta, 'compositeOperation', compositeOperation);
  },

  setActiveModuleMeta(state, { moduleName, key, value }) {
    outerState.active[moduleName].meta[key] = value;
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active[moduleName].meta, key, value);
  },

  incrementGroup(state, { moduleName, groupName }) {
    const { props, length } = outerState.active[moduleName][groupName];

    Object.keys(props).forEach((prop) => {
      const defaultValue = state.active[moduleName].props[groupName].props[prop].default;

      outerState.active[moduleName][groupName].props[prop][length] = defaultValue;
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active[moduleName][groupName].props[prop], length, defaultValue);
    });

    outerState.active[moduleName][groupName].length = length + 1;
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active[moduleName][groupName], 'length', length + 1);
  },

  decrementGroup(state, { moduleName, groupName }) {
    const { props, length } = outerState.active[moduleName][groupName];

    Object.keys(props).forEach((prop) => {
      delete outerState.active[moduleName][groupName].props[prop][length - 1];
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(state.active[moduleName][groupName].props[prop], length - 1);
    });

    outerState.active[moduleName][groupName].length = length - 1;
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.active[moduleName][groupName], 'length', length - 1);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1034:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__modv__ = __webpack_require__(21);



const state = {
  palettes: {},
};

// getters
const getters = {
  allPalettes: state => state.palettes,
};

// actions
const actions = {
  createPalette({ commit, state }, { id, colors, duration, moduleName, returnFormat, variable }) {
    return new Promise((resolve) => {
      if (id in state.palettes === true) resolve(state.palettes[id]);

      let colorsPassed = [];
      let durationPassed = 300;

      if (colors) colorsPassed = colors;
      if (duration) durationPassed = duration;

      __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].workers.palette.createPalette(id, colorsPassed, durationPassed, returnFormat);
      commit('addPalette', { id, colors, duration, moduleName, variable, returnFormat });
      resolve(state.palettes[id]);
    });
  },
  removePalette({ commit }, { id }) {
    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].workers.palette.removePalette(id);
    commit('removePalette', { id });
  },
  updateBpm({}, { bpm }) { //eslint-disable-line
    Object.keys(state.palettes).forEach((id) => {
      __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].workers.palette.setPalette(id, {
        bpm,
      });
    });
  },
  updateColors({ commit }, { id, colors }) {
    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].workers.palette.setPalette(id, {
      colors,
    });

    commit('updateColors', { id, colors });
  },
  updateDuration({ commit }, { id, duration }) {
    commit('updateDuration', { id, duration });

    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].workers.palette.setPalette(id, {
      timePeriod: duration,
    });
  },
  updateUseBpm({ commit }, { id, useBpm }) {
    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].workers.palette.setPalette(id, {
      useBpm,
    });

    commit('updateUseBpm', { id, useBpm });
  },
  updateBpmDivision({ commit }, { id, bpmDivision }) {
    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].workers.palette.setPalette(id, {
      bpmDivision,
    });

    commit('updateBpmDivision', { id, bpmDivision });
  },
  stepUpdate({ commit }, { id, currentStep, currentColor }) {
    if (!(id in state.palettes)) return;

    commit('updatePalette', {
      id,
      props: {
        currentStep,
        currentColor,
      },
    });
  },
  presetData({ state }, modulesToGet) {
    const data = {};

    Object.keys(state.palettes).forEach((key) => {
      const paletteData = state.palettes[key];
      if (modulesToGet.includes(paletteData.moduleName)) {
        data[key] = paletteData;
      }
    });

    return data;
  },
};

// mutations
const mutations = {
  addPalette(state, { id, colors, duration, useBpm, bpmDivision, moduleName, variable }) {
    if (id in state.palettes === false) {
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.palettes, id, {
        bpmDivision: bpmDivision || 16,
        duration: duration || 500,
        useBpm: useBpm || false,
        moduleName,
        colors,
        variable,
        currentColor: 0,
        currentStep: '',
      });
    }
  },
  removePalette(state, { id }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].delete(state.palettes, id);
  },
  updatePalette(state, { id, props }) {
    Object.keys(props).forEach(key => __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.palettes[id], key, props[key]));
  },
  updateColors(state, { id, colors }) {
    if (id in state.palettes) {
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.palettes[id], 'colors', colors);
    }
  },
  updateDuration(state, { id, duration }) {
    if (id in state.palettes) {
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.palettes[id], 'duration', duration);
    }
  },
  updateUseBpm(state, { id, useBpm }) {
    if (id in state.palettes) {
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.palettes[id], 'useBpm', useBpm);
    }
  },
  updateBpmDivision(state, { id, bpmDivision }) {
    if (id in state.palettes) {
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.palettes[id], 'bpmDivision', bpmDivision);
    }
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1035:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__modv__ = __webpack_require__(21);



const state = {
  plugins: {},
};

// getters
const getters = {
  allPlugins: state => Object.keys(state.plugins)
    .map(pluginName => state.plugins[pluginName]),

  enabledPlugins: state => Object.keys(state.plugins)
    .filter(pluginName => state.plugins[pluginName].enabled)
    .map(pluginName => state.plugins[pluginName]),

  plugins: state => state.plugins,

  pluginsWithGalleryTab: state => Object.keys(state.plugins).filter(
      pluginName => ('galleryTabComponent' in state.plugins[pluginName].plugin),
    )
    .reduce((obj, pluginName) => {
      obj[pluginName] = state.plugins[pluginName];
      return obj;
    }, {}),
};

// actions
const actions = {
  presetData({ state }) {
    const pluginData = {};

    Object.keys(state.plugins)
      .filter(pluginKey => state.plugins[pluginKey].enabled)
      .filter(pluginKey => 'presetData' in state.plugins[pluginKey].plugin)
      .forEach((pluginKey) => {
        const plugin = state.plugins[pluginKey].plugin;

        pluginData[pluginKey] = plugin.presetData.save();
      });

    return pluginData;
  },

  save({ state }, { pluginName, enabled }) {
    const MediaManager = __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].MediaManagerClient;
    const plugin = state.plugins[pluginName].plugin;

    if (!plugin) {
      throw new Error(`${pluginName} does not exist as a Plugin`);
    }

    let save;

    if (plugin.pluginData) {
      save = plugin.pluginData.save;
    }

    let enabledValue;

    if (typeof enabled === 'undefined') {
      enabledValue = state.plugins[pluginName].enabled;
    } else {
      enabledValue = enabled;
    }

    const payload = {
      meta: {
        enabled: enabledValue,
        name: pluginName,
      },
      values: save ? save() : {},
    };

    MediaManager.send({
      request: 'save-plugin',
      name: pluginName,
      profile: 'default',
      payload,
    });
  },

  load({ dispatch, state }, { pluginName, data, enabled = true }) {
    const plugin = state.plugins[pluginName].plugin;
    if (!plugin) {
      throw new Error(`${pluginName} does not exist as a Plugin`);
    }

    if (!data) {
      throw new Error('No data defined');
    }

    let load;

    if (plugin.pluginData) {
      load = plugin.pluginData.load;
    }

    if (load) load(data);

    dispatch('setEnabled', { pluginName, enabled });
  },
  setEnabled({ state, commit, dispatch }, { pluginName, enabled }) {
    const plugin = state.plugins[pluginName].plugin;
    if (!plugin) {
      throw new Error(`${pluginName} does not exist as a Plugin`);
    }

    if (enabled && plugin.on) {
      plugin.on();
    }

    if (!enabled && plugin.off) {
      plugin.off();
    }

    if (state.plugins[pluginName].enabled !== enabled) dispatch('save', { pluginName, enabled });
    commit('setEnabled', { pluginName, enabled });
  },
};

// mutations
const mutations = {
  addPlugin(state, { plugin }) {
    if (!('name' in plugin)) throw new Error('Plugin must have a name');

    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.plugins, plugin.name, { enabled: true, plugin });
  },
  setEnabled(state, { pluginName, enabled }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.plugins[pluginName], 'enabled', enabled);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1036:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__package_json__ = __webpack_require__(1764);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__package_json___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__package_json__);





const state = {
  projects: {},
  currentProject: 'default',
};

// getters
const getters = {
  allProjects: state => state.projects,
  currentProject: state => state.projects[state.currentProject],
  getPaletteFromProject: state => ({
    paletteName,
    projectName,
  }) => state.projects[projectName].palettes[paletteName],
};

// actions
const actions = {
  async savePresetToProject({}, { projectName, presetName }) { //eslint-disable-line
    const MediaManager = __WEBPACK_IMPORTED_MODULE_2__modv__["a" /* modV */].MediaManagerClient;

    const preset = {};

    const datetime = Date.now();
    const author = __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].getters['user/name'];
    const layers = await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('layers/presetData');
    const moduleData = await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/presetData');
    const paletteData = await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('palettes/presetData', Object.keys(moduleData));
    const pluginData = await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('plugins/presetData');
    preset.layers = layers;
    preset.moduleData = moduleData;
    preset.paletteData = paletteData;
    preset.pluginData = pluginData;

    preset.presetInfo = {
      name: presetName || `Preset by ${author} at ${datetime}`,
      datetime,
      modvVersion: __WEBPACK_IMPORTED_MODULE_3__package_json___default.a.version,
      author: __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].getters['user/name'],
    };

    MediaManager.send({
      request: 'save-preset',
      profile: projectName,
      name: presetName,
      payload: preset,
    });

    return preset;
  },
  loadPresetFromProject({}, { projectName, presetName }) { //eslint-disable-line
    const presetData = state.projects[projectName].presets[presetName];
    __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('projects/loadPreset', { presetData });
  },
  async loadPreset({}, { presetData }) { //eslint-disable-line
    await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('layers/removeAllLayers');

    presetData.layers.forEach(async (Layer) => {
      const { index } = await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('layers/addLayer');
      const layerIndex = index;

      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('layers/setAlpha', { layerIndex, alpha: Layer.alpha });
      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('layers/setBlending', { layerIndex, blending: Layer.blending });
      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('layers/setClearing', { layerIndex, clearing: Layer.clearing });
      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('layers/setCollapsed', { layerIndex, collapsed: Layer.collapsed });
      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('layers/setDrawToOutput', { layerIndex, drawToOutput: Layer.drawToOutput });
      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('layers/setEnabled', { layerIndex, enabled: Layer.enabled });
      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('layers/setInherit', { layerIndex, inherit: Layer.inherit });
      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('layers/setInheritFrom', { layerIndex, inheritFrom: Layer.inheritFrom });
      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('layers/setLocked', { layerIndex, locked: Layer.locked });
      // store.commit('layers/setModuleOrder', { layerIndex, moduleOrder: Layer.moduleOrder });
      await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('layers/setLayerName', { layerIndex, name: Layer.name });
      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('layers/setPipeline', { layerIndex, pipeline: Layer.pipeline });

      Layer.moduleOrder.forEach(async (moduleName, idx) => {
        const module = await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/createActiveModule', { moduleName });
        const data = presetData.moduleData[moduleName];

        await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'alpha',
          data: data.meta.alpha,
        });

        await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'author',
          data: data.meta.author,
        });

        await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'compositeOperation',
          data: data.meta.compositeOperation,
        });

        await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'enabled',
          data: data.meta.enabled,
        });

        await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'alpha',
          data: data.meta.alpha,
        });

        await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'originalName',
          data: data.meta.originalName,
        });

        await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'version',
          data: data.meta.version,
        });

        if ('import' in module) {
          module.import(data, moduleName);
        } else {
          Object.keys(data.values).forEach(async (variable) => {
            const value = data.values[variable];

            await __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/updateProp', {
              name: moduleName,
              prop: variable,
              data: value,
            });
          });
        }

        __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('layers/addModuleToLayer', {
          module,
          layerIndex,
          position: idx,
        });
      });

      if ('pluginData' in presetData) {
        const pluginData = presetData.pluginData;
        const currentPlugins = __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].state.plugins.plugins;

        Object.keys(pluginData)
          .filter(pluginDataKey => Object.keys(currentPlugins).indexOf(pluginDataKey) > -1)
          .filter(pluginDataKey => 'presetData' in currentPlugins[pluginDataKey].plugin)
          .forEach((pluginDataKey) => {
            const plugin = currentPlugins[pluginDataKey].plugin;
            plugin.presetData.load(pluginData[pluginDataKey]);
          });
      }
    });
  },
  savePaletteToProject({}, { projectName, paletteName, colors }) { //eslint-disable-line
    const MediaManager = __WEBPACK_IMPORTED_MODULE_2__modv__["a" /* modV */].MediaManagerClient;

    MediaManager.send({
      request: 'save-palette',
      profile: projectName,
      name: paletteName,
      payload: colors,
    });
  },
  setCurrent({ commit, state }, { projectName }) {
    if (!state.projects[projectName]) throw Error('Project does not exist');

    commit('setCurrent', { projectName });
    __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].commit('user/setProject', { projectName });

    Object.keys(state.projects[projectName].plugins)
      .forEach(pluginName => __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('plugins/load', {
        pluginName,
        data: state.projects[projectName].plugins[pluginName].values,
        enabled: state.projects[projectName].plugins[pluginName].meta.enabled,
      }));
  },
};

// mutations
const mutations = {
  addProject(state, { projectName, images, palettes, presets, videos, modules, plugins }) {
    const project = {};
    project.images = images || {};
    project.palettes = palettes || {};
    project.presets = presets || {};
    project.videos = videos || {};
    project.modules = modules || {};
    project.plugins = plugins || {};

    Object.keys(project.modules).forEach((moduleName) => {
      fetch(project.modules[moduleName])
        .then(response => response.text())
        .then((text) => {
          __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/register', {
            Module: eval(text).default, //eslint-disable-line
          });
        });
    });

    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state.projects, projectName, project);

    if (__WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].state.user.project === projectName) {
      __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('projects/setCurrent', { projectName });
    }
  },
  addPaletteToProject(state, { projectName, paletteName, colors }) {
    const project = state.projects[projectName];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(project.palettes, paletteName, colors);
  },
  addPresetToProject(state, { projectName, presetName, presetData }) {
    const project = state.projects[projectName];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(project.presets, presetName, presetData);
  },
  addModuleToProject(state, { projectName, presetName, path }) {
    const project = state.projects[projectName];

    fetch(path)
      .then(response => response.text())
      .then((text) => {
        __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].dispatch('modVModules/register', {
          Module: eval(text).default, //eslint-disable-line
        });
      });

    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(project.modules, presetName, path);
  },
  addPluginToProject(state, { projectName, pluginName, pluginData }) {
    const project = state.projects[projectName];
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(project.plugins, pluginName, pluginData);
  },
  setCurrent(state, { projectName }) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["default"].set(state, 'currentProject', projectName);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1037:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vue__ = __webpack_require__(28);




const state = {
  width: 200,
  height: 200,
  previewX: 0,
  previewY: 0,
  previewWidth: 0,
  previewHeight: 0,
};

// getters
const getters = {
  width: state => state.width,
  height: state => state.height,
  area: state => state.width * state.height,
  dimensions: state => ({ width: state.width, height: state.height }),
  previewValues: state => ({
    width: state.previewWidth,
    height: state.previewHeight,
    x: state.previewX,
    y: state.previewY,
  }),
};

// actions
const actions = {
  updateSize({ state }) {
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('size/setDimensions', {
      width: state.width,
      height: state.height,
    });
  },
  setDimensions({ commit, state }, { width, height }) {
    let widthShadow = width;
    let heightShadow = height;

    const largestWindowReference = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['windows/largestWindowReference']();
    if (
      widthShadow >= largestWindowReference.innerWidth &&
      heightShadow >= largestWindowReference.innerHeight
    ) {
      if (__WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['user/constrainToOneOne']) {
        if (widthShadow > heightShadow) {
          widthShadow = heightShadow;
        } else {
          heightShadow = widthShadow;
        }
      }

      commit('setDimensions', { width: widthShadow, height: heightShadow });

      let dpr = window.devicePixelRatio || 1;
      if (!__WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['user/useRetina']) dpr = 1;

      __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].resize(state.width, state.height, dpr);
      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('modVModules/resizeActive');
      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('layers/resize', { width: state.width, height: state.height, dpr });
      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('windows/resize', { width: state.width, height: state.height, dpr });
      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('size/calculatePreviewCanvasValues');
    }
  },
  resizePreviewCanvas() {
    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].previewCanvas.width = __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].previewCanvas.clientWidth;
    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].previewCanvas.height = __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].previewCanvas.clientHeight;
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('size/calculatePreviewCanvasValues');
  },
  calculatePreviewCanvasValues({ commit, state }) {
    // thanks to http://ninolopezweb.com/2016/05/18/how-to-preserve-html5-canvas-aspect-ratio/
    // for great aspect ratio advice!
    const widthToHeight = state.width / state.height;
    let newWidth = __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].previewCanvas.width;
    let newHeight = __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].previewCanvas.height;

    const newWidthToHeight = newWidth / newHeight;

    if (newWidthToHeight > widthToHeight) {
      newWidth = Math.round(newHeight * widthToHeight);
    } else {
      newHeight = Math.round(newWidth / widthToHeight);
    }

    commit('setPreviewValues', {
      x: Math.round((__WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].previewCanvas.width / 2) - (newWidth / 2)),
      y: Math.round((__WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].previewCanvas.height / 2) - (newHeight / 2)),
      width: newWidth,
      height: newHeight,
    });
  },
};

// mutations
const mutations = {
  setWidth(state, { width }) {
    __WEBPACK_IMPORTED_MODULE_2_vue__["default"].set(state, 'width', width);
  },
  setHeight(state, { height }) {
    __WEBPACK_IMPORTED_MODULE_2_vue__["default"].set(state, 'height', height);
  },
  setDimensions(state, { width, height }) {
    __WEBPACK_IMPORTED_MODULE_2_vue__["default"].set(state, 'width', width);
    __WEBPACK_IMPORTED_MODULE_2_vue__["default"].set(state, 'height', height);
  },
  setPreviewValues(state, { width, height, x, y }) {
    __WEBPACK_IMPORTED_MODULE_2_vue__["default"].set(state, 'previewWidth', width);
    __WEBPACK_IMPORTED_MODULE_2_vue__["default"].set(state, 'previewHeight', height);
    __WEBPACK_IMPORTED_MODULE_2_vue__["default"].set(state, 'previewX', x);
    __WEBPACK_IMPORTED_MODULE_2_vue__["default"].set(state, 'previewY', y);
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1038:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(16);


const state = {
  bpm: 120,
  detect: true,
};

// getters
const getters = {
  bpm: state => state.bpm,
  detect: state => state.detect,
};

// actions
const actions = {
  setBpm({ commit }, { bpm }) {
    commit('setBpm', { bpm });
    __WEBPACK_IMPORTED_MODULE_0__index__["a" /* default */].dispatch('palettes/updateBpm', { bpm });
  },
};

// mutations
const mutations = {
  setBpm(state, { bpm }) {
    state.bpm = bpm;
  },
  setBpmDetect(state, { detect }) {
    state.detect = detect;
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1039:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__modv__ = __webpack_require__(21);



const state = {
  mediaPath: undefined,
  name: 'A modV user',
  useRetina: true,
  currentAudioId: '',
  currentVideoId: '',
  showStats: false,
  constrainToOneOne: false,
  project: 'default',
};

// getters
const getters = {
  mediaPath: state => state.mediaPath,
  name: state => state.name,
  useRetina: state => state.useRetina,
  currentAudioSource: state => state.currentAudioId,
  currentVideoSource: state => state.currentVideoId,
  showStats: state => state.showStats,
  constrainToOneOne: state => state.constrainToOneOne,
};

// actions
const actions = {
  setUseRetina({ commit }, { useRetina }) {
    let dpr = window.devicePixelRatio || 1;
    if (!useRetina) dpr = 1;

    commit('setUseRetina', { useRetina });

    const width = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['size/width'];
    const height = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['size/height'];

    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].resize(width, height, dpr);
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('modVModules/resizeActive');
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('layers/resize', { width, height, dpr });
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('windows/resize', { width, height, dpr });
  },
  setCurrentAudioSource({ commit, state }, { sourceId }) {
    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].setMediaStreamSource({
      audioSourceId: sourceId,
      videoSourceId: state.currentVideoId,
    }).then(() => {
      commit('setCurrentAudioSource', { sourceId });
    });
  },
  setCurrentVideoSource({ commit, state }, { sourceId }) {
    __WEBPACK_IMPORTED_MODULE_1__modv__["a" /* modV */].setMediaStreamSource({
      audioSourceId: state.currentAudioId,
      videoSourceId: sourceId,
    }).then(() => {
      commit('setCurrentVideoSource', { sourceId });
    });
  },
  setConstrainToOneOne({ commit }, shouldConstrain) {
    commit('setConstrainToOneOne', shouldConstrain);
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('size/updateSize');
  },
};

// mutations
const mutations = {
  setMediaPath(state, { path }) {
    state.mediaPath = path;
  },
  setName(state, { name }) {
    state.name = name;
  },
  setUseRetina(state, { useRetina }) {
    state.useRetina = useRetina;
  },
  setCurrentAudioSource(state, { sourceId }) {
    state.currentAudioId = sourceId;
  },
  setCurrentVideoSource(state, { sourceId }) {
    state.currentVideoId = sourceId;
  },
  setConstrainToOneOne(state, shouldConstrain) {
    state.constrainToOneOne = shouldConstrain;
  },
  setProject(state, { projectName }) {
    state.project = projectName;
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1040:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modv_window_controller__ = __webpack_require__(1028);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__modv_get_largest_window__ = __webpack_require__(1020);



const state = {
  windows: [],
  size: { width: 0, height: 0 },
};

// We can't store Window Objects in Vuex because the Observer traversal exceeds the stack size
const externalState = [];

// getters
const getters = {
  allWindows: state => state.windows,
  windowReference: () => index => externalState[index],
  largestWindowSize: state => state.size,
  largestWindowReference() {
    return () => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__modv_get_largest_window__["a" /* default */])(state.windows).window || externalState[0];
  },
  largestWindowController() {
    return () => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__modv_get_largest_window__["a" /* default */])(state.windows).controller;
  },
};

// actions
const actions = {
  createWindow({ commit }, { Vue }) {
    return new __WEBPACK_IMPORTED_MODULE_0__modv_window_controller__["a" /* default */](Vue).then((windowController) => {
      const windowRef = windowController.window;
      delete windowController.window;
      commit('addWindow', { windowController, windowRef });
      return windowController;
    });
  },
  destroyWindow({ commit }, { windowRef }) {
    commit('removeWindow', { windowRef });
  },
  resize({ state, commit }, { width, height, dpr }) {
    state.windows.forEach((windowController) => {
      windowController.resize(width, height, dpr, false);
    });

    commit('setSize', { width, height, dpr });
  },
};

// mutations
const mutations = {
  addWindow(state, { windowController, windowRef }) {
    const index = state.windows.length;
    windowController.window = index;
    state.windows.push(windowController);
    externalState.push(windowRef);
    getters.largestWindowReference();
  },
  removeWindow(state, { windowRef }) {
    state.windows.splice(windowRef, 1);
    externalState.splice(windowRef, 1);
    getters.largestWindowReference();
  },
  setSize(state, { width, height, dpr }) {
    state.size = {
      width,
      height,
      dpr,
      area: (width * height),
    };
  },
};

/* harmony default export */ __webpack_exports__["a"] = ({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});


/***/ }),

/***/ 1042:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1043:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1044:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1045:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1046:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1047:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1048:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1049:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1050:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1051:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1052:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1053:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1054:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1055:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1056:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1057:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1058:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1059:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1060:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1061:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1062:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1063:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1064:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1065:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1066:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1067:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1068:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1069:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1070:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1071:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1072:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1073:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1074:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1075:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1076:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1077:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1078:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1079:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1080:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1081:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1082:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1083:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1084:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 1085:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 149:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_hsy_vue_dropdown__ = __webpack_require__(767);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_hsy_vue_dropdown___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_hsy_vue_dropdown__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vue_shortkey__ = __webpack_require__(769);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vue_shortkey___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_vue_shortkey__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vue_throttle_event__ = __webpack_require__(770);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vue_throttle_event___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_vue_throttle_event__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_buefy__ = __webpack_require__(755);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_buefy___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_buefy__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_vuebar__ = __webpack_require__(771);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_vuebar___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_vuebar__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__vuePlugins_capitalize_filter__ = __webpack_require__(765);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__App__ = __webpack_require__(768);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__App___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__App__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__extra_context_menu__ = __webpack_require__(756);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__extra_expression__ = __webpack_require__(757);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__extra_midi_assignment__ = __webpack_require__(761);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__extra_feature_assignment__ = __webpack_require__(758);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__extra_lfo__ = __webpack_require__(760);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__extra_grab_canvas__ = __webpack_require__(759);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__extra_slim_ui__ = __webpack_require__(763);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__extra_shadertoy__ = __webpack_require__(762);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__assets_styles_index_scss__ = __webpack_require__(766);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__assets_styles_index_scss___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_18__assets_styles_index_scss__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__extra_ui_resize_attach__ = __webpack_require__(764);
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
























__WEBPACK_IMPORTED_MODULE_0_vue__["default"].config.productionTip = false;

Object.defineProperty(__WEBPACK_IMPORTED_MODULE_0_vue__["default"].prototype, '$modV', {
  get() {
    return __WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */];
  },
});

__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_6__vuePlugins_capitalize_filter__["a" /* default */]);

__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_5_vuebar___default.a);
__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_4_buefy___default.a, {
  defaultIconPack: 'fa',
});
__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_3_vue_throttle_event___default.a);
__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_1_hsy_vue_dropdown___default.a);
__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_2_vue_shortkey___default.a);

__WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].use(__WEBPACK_IMPORTED_MODULE_10__extra_context_menu__["a" /* default */]);
__WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].use(__WEBPACK_IMPORTED_MODULE_13__extra_feature_assignment__["a" /* default */]);
__WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].use(__WEBPACK_IMPORTED_MODULE_11__extra_expression__["a" /* default */]);
__WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].use(__WEBPACK_IMPORTED_MODULE_12__extra_midi_assignment__["a" /* default */]);
__WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].use(__WEBPACK_IMPORTED_MODULE_14__extra_lfo__["a" /* default */]);
__WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].use(__WEBPACK_IMPORTED_MODULE_15__extra_grab_canvas__["a" /* default */]);
__WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].use(__WEBPACK_IMPORTED_MODULE_16__extra_slim_ui__["a" /* default */]);
__WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].use(__WEBPACK_IMPORTED_MODULE_17__extra_shadertoy__["a" /* default */]);

/* eslint-disable no-new */
/* harmony default export */ __webpack_exports__["default"] = (window.modVVue = new __WEBPACK_IMPORTED_MODULE_0_vue__["default"]({
  el: '#app',
  template: '<App/>',
  components: { App: __WEBPACK_IMPORTED_MODULE_8__App___default.a },
  store: __WEBPACK_IMPORTED_MODULE_9__store__["a" /* default */],
  data: {
    modV: __WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */],
  },
  mounted() {
    __WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].start(this);

    const modules = [
      'Text',
      'Webcam',
      'Plasma',
      'ChromaticAbberation',
      'Wobble',
      'Neon',
      'Fisheye',
      'MirrorEdge',
      'EdgeDistort',
      'Polygon',
      // 'Concentrics',
      'Phyllotaxis',
      'Pixelate-2.0',
      'Ball-2.0',
      'Concentrics',
      'Concentrics-2.0',
      'Waveform-2.0',
      'Un-Deux-Trois',
      'OpticalFlowDistort-2.0',
      'MattiasCRT-2.0',
      'Doughnut_Generator',
    ];

    modules.forEach((fileName) => {
      __webpack_require__(772)(`./${fileName}`).then((Module) => {
        __WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].register(Module.default);
      });
    });

    const isfSamples = [
      'film-grain.fs',
      'block-color.fs',
      'plasma.fs',
      'Random Shape.fs',
      'Triangles.fs',
      'Echo Trace.fs',
      'rgbtimeglitch.fs',
      'badtv.fs',
      'feedback.fs',
      'rgbglitchmod.fs',
      'tapestryfract.fs',
      'hexagons.fs',
      'UltimateFlame.fs',
      'CompoundWaveStudy1.fs',
      'FractilianParabolicCircleInversion.fs',
      'ASCII Art.fs',
      'CollapsingArchitecture.fs',
      'Dither-Bayer.fs',
      'GreatBallOfFire.fs',
      'VHS Glitch.fs.fs',
      'Zebre.fs',
      'st_lsfGDH.fs',
      'st_Ms2SD1.fs.fs',
      'rotozoomer.fs',
      'Kaleidoscope.fs',
      'RGB Halftone-lookaround.fs',
      'Circuits.fs',
      'BrightnessContrast.fs',
      'UltimateSpiral.fs',
      'MBOX3.fs',
      'HexVortex.fs',
      'Hue-Saturation.fs',
      'Vignette.fs',
      'v002 Crosshatch.fs',
      'Sine Warp Tile.fs',
      'RGB Trails 3.0.fs',
      'RGB Strobe.fs',
      'Kaleidoscope Tile.fs',
      'Interlace.fs',
      'Convergence.fs',
      'Collage.fs',
      'Pinch.fs',
      'Slice.fs',
      'digital-crystal-tunnel.fs',
      'film-grain.fs',
      'spherical-shader-tut.fs',
      'scale.fs',
      'LogTransWarpSpiral.fs',
    ];

    isfSamples.forEach((fileName) => {
      __webpack_require__(773)(`./${fileName}`).then((fragmentShader) => {
        __WEBPACK_IMPORTED_MODULE_7__modv__["a" /* modV */].register({
          meta: {
            name: fileName,
            author: '',
            version: '1.0.0',
            type: 'isf',
          },
          fragmentShader,
          vertexShader: 'void main() {isf_vertShaderInit();}',
        });
      }).catch((e) => {
        throw new Error(e);
      });
    });

    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_19__extra_ui_resize_attach__["a" /* default */])();
  },
}));


/***/ }),

/***/ 16:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuex_localstorage__ = __webpack_require__(1761);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuex_localstorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_vuex_localstorage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__modules_control_panels__ = __webpack_require__(1029);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__modules_layers__ = __webpack_require__(1030);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__modules_media_stream__ = __webpack_require__(1031);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__modules_meyda__ = __webpack_require__(1032);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__modules_modv_modules__ = __webpack_require__(1033);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__modules_palettes__ = __webpack_require__(1034);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__modules_plugins__ = __webpack_require__(1035);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__modules_projects__ = __webpack_require__(1036);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__modules_size__ = __webpack_require__(1037);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__modules_tempo__ = __webpack_require__(1038);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__modules_user__ = __webpack_require__(1039);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__modules_windows__ = __webpack_require__(1040);
















__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_1_vuex__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_1_vuex__["a" /* default */].Store({
  plugins: [
    __WEBPACK_IMPORTED_MODULE_2_vuex_localstorage___default()({
      namespace: 'modv',
      initialState: {},
      paths: ['user'],
      expires: 0, // Never expire
    }),
  ],
  modules: {
    controlPanels: __WEBPACK_IMPORTED_MODULE_3__modules_control_panels__["a" /* default */],
    layers: __WEBPACK_IMPORTED_MODULE_4__modules_layers__["a" /* default */],
    mediaStream: __WEBPACK_IMPORTED_MODULE_5__modules_media_stream__["a" /* default */],
    meyda: __WEBPACK_IMPORTED_MODULE_6__modules_meyda__["a" /* default */],
    modVModules: __WEBPACK_IMPORTED_MODULE_7__modules_modv_modules__["a" /* default */],
    palettes: __WEBPACK_IMPORTED_MODULE_8__modules_palettes__["a" /* default */],
    plugins: __WEBPACK_IMPORTED_MODULE_9__modules_plugins__["a" /* default */],
    projects: __WEBPACK_IMPORTED_MODULE_10__modules_projects__["a" /* default */],
    size: __WEBPACK_IMPORTED_MODULE_11__modules_size__["a" /* default */],
    tempo: __WEBPACK_IMPORTED_MODULE_12__modules_tempo__["a" /* default */],
    user: __WEBPACK_IMPORTED_MODULE_13__modules_user__["a" /* default */],
    windows: __WEBPACK_IMPORTED_MODULE_14__modules_windows__["a" /* default */],
  },
  strict: false,
}));


/***/ }),

/***/ 1659:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Event {
    constructor(type, target) {
        this.target = target;
        this.type = type;
    }
}
class ErrorEvent extends Event {
    constructor(error, target) {
        super('error', target);
        this.message = error.message;
        this.error = error;
    }
}
class CloseEvent extends Event {
    constructor(code = 1000, reason = '', target) {
        super('close', target);
        this.wasClean = true;
        this.code = code;
        this.reason = reason;
    }
}

/*!
 * Reconnecting WebSocket
 * by Pedro Ladaria <pedro.ladaria@gmail.com>
 * https://github.com/pladaria/reconnecting-websocket
 * License MIT
 */
const getGlobalWebSocket = () => {
    if (typeof WebSocket !== 'undefined') {
        // @ts-ignore
        return WebSocket;
    }
};
/**
 * Returns true if given argument looks like a WebSocket class
 */
const isWebSocket = (w) => typeof w === 'function' && w.CLOSING === 2;
const DEFAULT = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000 + Math.random() * 4000,
    minUptime: 5000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 4000,
    maxRetries: Infinity,
    debug: false,
};
class ReconnectingWebSocket {
    constructor(url, protocols, options = {}) {
        this._listeners = {
            error: [],
            message: [],
            open: [],
            close: [],
        };
        this._retryCount = -1;
        this._shouldReconnect = true;
        this._connectLock = false;
        this._binaryType = 'blob';
        this.eventToHandler = new Map([
            ['open', this._handleOpen.bind(this)],
            ['close', this._handleClose.bind(this)],
            ['error', this._handleError.bind(this)],
            ['message', this._handleMessage.bind(this)],
        ]);
        /**
         * An event listener to be called when the WebSocket connection's readyState changes to CLOSED
         */
        this.onclose = undefined;
        /**
         * An event listener to be called when an error occurs
         */
        this.onerror = undefined;
        /**
         * An event listener to be called when a message is received from the server
         */
        this.onmessage = undefined;
        /**
         * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
         * this indicates that the connection is ready to send and receive data
         */
        this.onopen = undefined;
        this._url = url;
        this._protocols = protocols;
        this._options = options;
        this._connect();
    }
    static get CONNECTING() {
        return 0;
    }
    static get OPEN() {
        return 1;
    }
    static get CLOSING() {
        return 2;
    }
    static get CLOSED() {
        return 3;
    }
    get CONNECTING() {
        return ReconnectingWebSocket.CONNECTING;
    }
    get OPEN() {
        return ReconnectingWebSocket.OPEN;
    }
    get CLOSING() {
        return ReconnectingWebSocket.CLOSING;
    }
    get CLOSED() {
        return ReconnectingWebSocket.CLOSED;
    }
    get binaryType() {
        return this._ws ? this._ws.binaryType : this._binaryType;
    }
    set binaryType(value) {
        this._binaryType = value;
        if (this._ws) {
            // @ts-ignore
            this._ws.binaryType = value;
        }
    }
    /**
     * Returns the number or connection retries
     */
    get retryCount() {
        return Math.max(this._retryCount, 0);
    }
    /**
     * The number of bytes of data that have been queued using calls to send() but not yet
     * transmitted to the network. This value resets to zero once all queued data has been sent.
     * This value does not reset to zero when the connection is closed; if you keep calling send(),
     * this will continue to climb. Read only
     */
    get bufferedAmount() {
        return this._ws ? this._ws.bufferedAmount : 0;
    }
    /**
     * The extensions selected by the server. This is currently only the empty string or a list of
     * extensions as negotiated by the connection
     */
    get extensions() {
        return this._ws ? this._ws.extensions : '';
    }
    /**
     * A string indicating the name of the sub-protocol the server selected;
     * this will be one of the strings specified in the protocols parameter when creating the
     * WebSocket object
     */
    get protocol() {
        return this._ws ? this._ws.protocol : '';
    }
    /**
     * The current state of the connection; this is one of the Ready state constants
     */
    get readyState() {
        return this._ws ? this._ws.readyState : ReconnectingWebSocket.CONNECTING;
    }
    /**
     * The URL as resolved by the constructor
     */
    get url() {
        return this._ws ? this._ws.url : '';
    }
    /**
     * Closes the WebSocket connection or connection attempt, if any. If the connection is already
     * CLOSED, this method does nothing
     */
    close(code, reason) {
        this._shouldReconnect = false;
        if (!this._ws || this._ws.readyState === this.CLOSED) {
            return;
        }
        this._ws.close(code, reason);
    }
    /**
     * Closes the WebSocket connection or connection attempt and connects again.
     * Resets retry counter;
     */
    reconnect(code, reason) {
        this._shouldReconnect = true;
        this._retryCount = -1;
        if (!this._ws || this._ws.readyState === this.CLOSED) {
            this._connect();
        }
        this._disconnect(code, reason);
        this._connect();
    }
    /**
     * Enqueues the specified data to be transmitted to the server over the WebSocket connection
     */
    send(data) {
        if (this._ws) {
            this._ws.send(data);
        }
    }
    /**
     * Register an event handler of a specific event type
     */
    addEventListener(type, listener) {
        if (this._listeners[type]) {
            // @ts-ignore
            this._listeners[type].push(listener);
        }
    }
    /**
     * Removes an event listener
     */
    removeEventListener(type, listener) {
        if (this._listeners[type]) {
            // @ts-ignore
            this._listeners[type] = this._listeners[type].filter(l => l !== listener);
        }
    }
    _debug(...params) {
        if (this._options.debug) {
            // tslint:disable-next-line
            console.log('RWS>', ...params);
        }
    }
    _getNextDelay() {
        let delay = 0;
        if (this._retryCount > 0) {
            const { reconnectionDelayGrowFactor = DEFAULT.reconnectionDelayGrowFactor, minReconnectionDelay = DEFAULT.minReconnectionDelay, maxReconnectionDelay = DEFAULT.maxReconnectionDelay, } = this._options;
            delay =
                minReconnectionDelay + Math.pow(this._retryCount - 1, reconnectionDelayGrowFactor);
            if (delay > maxReconnectionDelay) {
                delay = maxReconnectionDelay;
            }
        }
        this._debug('next delay', delay);
        return delay;
    }
    _wait() {
        return new Promise(resolve => {
            setTimeout(resolve, this._getNextDelay());
        });
    }
    /**
     * @return Promise<string>
     */
    _getNextUrl(urlProvider) {
        if (typeof urlProvider === 'string') {
            return Promise.resolve(urlProvider);
        }
        if (typeof urlProvider === 'function') {
            const url = urlProvider();
            if (typeof url === 'string') {
                return Promise.resolve(url);
            }
            if (url.then) {
                return url;
            }
        }
        throw Error('Invalid URL');
    }
    _connect() {
        if (this._connectLock) {
            return;
        }
        this._connectLock = true;
        const { maxRetries = DEFAULT.maxRetries, connectionTimeout = DEFAULT.connectionTimeout, WebSocket = getGlobalWebSocket(), } = this._options;
        if (this._retryCount >= maxRetries) {
            this._debug('max retries reached', this._retryCount, '>=', maxRetries);
            return;
        }
        this._retryCount++;
        this._debug('connect', this._retryCount);
        this._removeListeners();
        if (!isWebSocket(WebSocket)) {
            throw Error('No valid WebSocket class provided');
        }
        this._wait()
            .then(() => this._getNextUrl(this._url))
            .then(url => {
            this._debug('connect', { url, protocols: this._protocols });
            this._ws = new WebSocket(url, this._protocols);
            // @ts-ignore
            this._ws.binaryType = this._binaryType;
            this._connectLock = false;
            this._addListeners();
            this._connectTimeout = setTimeout(() => this._handleTimeout(), connectionTimeout);
        });
    }
    _handleTimeout() {
        this._debug('timeout event');
        this._handleError(new ErrorEvent(Error('TIMEOUT'), this));
    }
    _disconnect(code, reason) {
        clearTimeout(this._connectTimeout);
        if (!this._ws) {
            return;
        }
        this._removeListeners();
        try {
            this._ws.close(code, reason);
            this._handleClose(new CloseEvent(code, reason, this));
        }
        catch (error) {
            // ignore
        }
    }
    _acceptOpen() {
        this._retryCount = 0;
    }
    _handleOpen(event) {
        this._debug('open event');
        const { minUptime = DEFAULT.minUptime } = this._options;
        clearTimeout(this._connectTimeout);
        this._uptimeTimeout = setTimeout(() => this._acceptOpen(), minUptime);
        this._debug('assign binary type');
        // @ts-ignore
        this._ws.binaryType = this._binaryType;
        if (this.onopen) {
            this.onopen(event);
        }
        this._listeners.open.forEach(listener => listener(event));
    }
    _handleMessage(event) {
        this._debug('message event');
        if (this.onmessage) {
            this.onmessage(event);
        }
        this._listeners.message.forEach(listener => listener(event));
    }
    _handleError(event) {
        this._debug('error event', event.message);
        this._disconnect(undefined, event.message === 'TIMEOUT' ? 'timeout' : undefined);
        if (this.onerror) {
            this.onerror(event);
        }
        this._debug('exec error listeners');
        this._listeners.error.forEach(listener => listener(event));
        this._connect();
    }
    _handleClose(event) {
        this._debug('close event');
        if (this.onclose) {
            this.onclose(event);
        }
        this._listeners.close.forEach(listener => listener(event));
    }
    /**
     * Remove event listeners to WebSocket instance
     */
    _removeListeners() {
        if (!this._ws) {
            return;
        }
        this._debug('removeListeners');
        for (const [type, handler] of this.eventToHandler) {
            this._ws.removeEventListener(type, handler);
        }
    }
    /**
     * Assign event listeners to WebSocket instance
     */
    _addListeners() {
        this._debug('addListeners');
        for (const [type, handler] of this.eventToHandler) {
            this._ws.addEventListener(type, handler);
        }
    }
}

/* harmony default export */ __webpack_exports__["a"] = (ReconnectingWebSocket);


/***/ }),

/***/ 1674:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1080)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(912),
  /* template */
  __webpack_require__(1752),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1675:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1076)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(913),
  /* template */
  __webpack_require__(1748),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1676:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1057)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(914),
  /* template */
  __webpack_require__(1728),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1677:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(917),
  /* template */
  __webpack_require__(1753),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1678:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(919),
  /* template */
  __webpack_require__(1727),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1679:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1058)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(920),
  /* template */
  __webpack_require__(1729),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1680:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1051)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(922),
  /* template */
  __webpack_require__(1721),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1681:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1053)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(927),
  /* template */
  __webpack_require__(1723),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1682:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1072)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(928),
  /* template */
  __webpack_require__(1744),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-76c30a5c",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1683:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1077)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(929),
  /* template */
  __webpack_require__(1749),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-ad710ad0",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1684:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1060)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(930),
  /* template */
  __webpack_require__(1731),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-437c2af5",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1685:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1045)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(931),
  /* template */
  __webpack_require__(1715),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-0db63f71",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1686:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1073)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(932),
  /* template */
  __webpack_require__(1745),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-7823ef76",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1687:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1069)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(933),
  /* template */
  __webpack_require__(1740),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-65790797",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1688:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1064)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(934),
  /* template */
  __webpack_require__(1734),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-4f3db9c6",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1689:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1062)
  __webpack_require__(1063)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(935),
  /* template */
  __webpack_require__(1733),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-4597a044",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1690:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1068)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(938),
  /* template */
  __webpack_require__(1739),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-5fbaf543",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1691:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1083)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(939),
  /* template */
  __webpack_require__(1756),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1692:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1048)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(940),
  /* template */
  __webpack_require__(1718),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-14aacba2",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1693:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1066)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(941),
  /* template */
  __webpack_require__(1736),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-5717394f",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1694:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1042)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(942),
  /* template */
  __webpack_require__(1711),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-02799802",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1695:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1061)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(943),
  /* template */
  __webpack_require__(1732),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1696:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1079)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(944),
  /* template */
  __webpack_require__(1751),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-c062d3f8",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1697:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1085)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(945),
  /* template */
  __webpack_require__(1758),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-fca3bf92",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1698:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(946),
  /* template */
  __webpack_require__(1713),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1699:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1075)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(947),
  /* template */
  __webpack_require__(1747),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1700:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1067)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(948),
  /* template */
  __webpack_require__(1737),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-587228df",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1701:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1047)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(949),
  /* template */
  __webpack_require__(1717),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1702:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1043)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(950),
  /* template */
  __webpack_require__(1712),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-0611ff60",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1703:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1052)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(951),
  /* template */
  __webpack_require__(1722),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-272c026d",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1704:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1056)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(952),
  /* template */
  __webpack_require__(1726),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1705:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1050)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(953),
  /* template */
  __webpack_require__(1720),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1706:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1071)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(954),
  /* template */
  __webpack_require__(1742),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1707:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1081)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(955),
  /* template */
  __webpack_require__(1754),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1708:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1044)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(956),
  /* template */
  __webpack_require__(1714),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1709:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(957),
  /* template */
  __webpack_require__(1738),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1710:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1055)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(958),
  /* template */
  __webpack_require__(1725),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 1711:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "layer-menu"
  }, [_c('add-layer-button'), _vm._v(" "), _c('remove-layer-button')], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1712:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', _vm._l((_vm.activeMenus), function(menu, idx) {
    return _c('context-menu', {
      key: idx,
      attrs: {
        "options": menu
      }
    })
  }))
},staticRenderFns: []}

/***/ }),

/***/ 1713:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('span', {
    staticClass: "tag",
    on: {
      "dblclick": function($event) {
        _vm.modalOpen = true
      }
    }
  }, [_vm._v(_vm._s(_vm.$store.state.projects.currentProject))]), _vm._v(" "), _c('b-modal', {
    attrs: {
      "active": _vm.modalOpen
    },
    on: {
      "update:active": function($event) {
        _vm.modalOpen = $event
      }
    }
  }, [_c('div', {
    staticClass: "card"
  }, [_c('div', {
    staticClass: "card-content"
  }, [_c('h1', {
    staticClass: "title"
  }, [_vm._v("Projects")]), _vm._v(" "), _c('div', {
    staticClass: "columns is-mobile is-multiline"
  }, _vm._l((Object.keys(_vm.$store.state.projects.projects)), function(projectName) {
    return _c('div', {
      staticClass: "column is-12"
    }, [_c('div', {
      staticClass: "columns"
    }, [_c('div', {
      staticClass: "column is-10"
    }, [_vm._v("\n                " + _vm._s(projectName) + "\n              ")]), _vm._v(" "), _c('div', {
      staticClass: "column is-2"
    }, [_c('button', {
      staticClass: "button is-dark is-outlined",
      attrs: {
        "disabled": !_vm.isCurrent(projectName)
      },
      on: {
        "click": function($event) {
          _vm.useProject({
            projectName: projectName
          })
        }
      }
    }, [_vm._v(_vm._s(_vm.isCurrent(projectName) ? 'Use' : 'In use'))])])])])
  }))])])])], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1714:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "columns is-multiline"
  }, [_c('div', {
    staticClass: "column is-12"
  }, [_vm._v("\n    Devices:\n  ")]), _vm._v(" "), _vm._l((_vm.devices), function(device, deviceName) {
    return _c('div', {
      staticClass: "column is-12"
    }, [_vm._v("\n    " + _vm._s(deviceName) + "\n  ")])
  }), _vm._v(" "), _c('div', {
    staticClass: "column is-12"
  }, [_vm._v("\n    Assignments:\n  ")]), _vm._v(" "), _vm._l((_vm.assignments), function(assignment) {
    return _c('div', {
      staticClass: "column is-12"
    }, [_vm._v("\n    " + _vm._s(assignment) + "\n  ")])
  })], 2)
},staticRenderFns: []}

/***/ }),

/***/ 1715:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "preset-gallery columns is-gapless is-multiline"
  }, [_c('div', {
    staticClass: "column is-12"
  }, [_c('div', {
    staticClass: "columns is-multiline"
  }, _vm._l((_vm.plugins), function(plugin, pluginName) {
    return _c('div', {
      staticClass: "column is-12"
    }, [_c('div', [_c('b-switch', {
      staticClass: "has-text-light",
      attrs: {
        "value": plugin.enabled
      },
      on: {
        "input": function($event) {
          _vm.switchPlugin($event, {
            pluginName: pluginName
          })
        }
      }
    }, [_vm._v("\n            " + _vm._s(pluginName) + "\n          ")]), _vm._v(" "), ('controlPanelComponent' in plugin.plugin) ? _c('div', [_c(plugin.plugin.controlPanelComponent.name, {
      tag: "component"
    }), _vm._v(" "), (plugin.plugin.pluginData) ? _c('div', {
      staticClass: "has-text-right"
    }, [_c('button', {
      staticClass: "button",
      on: {
        "click": function($event) {
          _vm.savePluginSettings({
            pluginName: pluginName
          })
        }
      }
    }, [_vm._v("\n                Save settings\n              ")])]) : _vm._e()], 1) : _vm._e()], 1)])
  }))])])
},staticRenderFns: []}

/***/ }),

/***/ 1716:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    directives: [{
      name: "context-menu",
      rawName: "v-context-menu",
      value: (_vm.menuOptions),
      expression: "menuOptions"
    }],
    staticClass: "range-control",
    attrs: {
      "data-moduleName": _vm.moduleName
    }
  }, [_c('b-field', {
    attrs: {
      "label": _vm.label,
      "addons": false
    }
  }, [_c('canvas', {
    ref: "canvas",
    staticClass: "control",
    on: {
      "mousedown": _vm.mouseDown,
      "touchstart": _vm.touchstart,
      "touchmove": _vm.touchmove,
      "touchend": _vm.touchend,
      "mousemove": _vm.mouseMove,
      "click": _vm.click
    }
  }), _vm._v(" "), _c('b-input', {
    staticClass: "pure-form-message-inline",
    attrs: {
      "placeholder": "Number",
      "type": "number",
      "step": "any"
    },
    model: {
      value: (_vm.value),
      callback: function($$v) {
        _vm.value = _vm._n($$v)
      },
      expression: "value"
    }
  })], 1)], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1717:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('keep-alive', [_c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [(_vm.visible) ? _c('ul', {
    ref: "menu",
    staticClass: "nwjs-menu contextmenu"
  }, _vm._l((_vm.items), function(item, idx) {
    return _c("contextMenuItem", {
      key: idx,
      tag: "component",
      attrs: {
        "options": item,
        "parentOptions": _vm.options,
        "parentOffsetWidth": _vm.offsetWidth,
        "parentOffsetHeight": _vm.offsetHeight,
        "parentPosition": {
          x: _vm.options.x,
          y: _vm.options.y
        },
        "index": idx
      }
    })
  })) : _vm._e()])], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1718:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('button', {
    staticClass: "button is-primary is-small",
    attrs: {
      "title": "Create New Layer"
    },
    on: {
      "click": _vm.addLayer
    }
  }, [_c('b-icon', {
    attrs: {
      "icon": "plus"
    }
  })], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1719:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "select-control",
    attrs: {
      "data-moduleName": _vm.moduleName
    }
  }, [_c('b-field', {
    attrs: {
      "label": _vm.label,
      "addons": false
    }
  }, [_c('b-dropdown', {
    staticClass: "dropdown",
    model: {
      value: (_vm.value),
      callback: function($$v) {
        _vm.value = $$v
      },
      expression: "value"
    }
  }, [_c('button', {
    staticClass: "button is-primary is-small",
    attrs: {
      "slot": "trigger"
    },
    slot: "trigger"
  }, [_c('span', [_vm._v(_vm._s(_vm._f("capitalize")(_vm.selectedLabel)))]), _vm._v(" "), _c('b-icon', {
    attrs: {
      "icon": "angle-down"
    }
  })], 1), _vm._v(" "), _vm._l((_vm.enumVals), function(enumValue, idx) {
    return _c('b-dropdown-item', {
      key: idx,
      attrs: {
        "value": enumValue.value
      }
    }, [_vm._v(_vm._s(_vm._f("capitalize")(enumValue.label)))])
  })], 2)], 1)], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1720:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('li', [_c('label', {
    class: {
      hidden: _vm.editable
    },
    on: {
      "dblclick": _vm.startEditable
    }
  }, [_vm._v(_vm._s(_vm.nameInput))]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.nameInput),
      expression: "nameInput"
    }],
    ref: "editableInput",
    class: {
      hidden: !_vm.editable
    },
    attrs: {
      "type": "text"
    },
    domProps: {
      "value": (_vm.nameInput)
    },
    on: {
      "keypress": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key)) { return null; }
        _vm.endEditable($event)
      },
      "blur": _vm.endEditable,
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.nameInput = $event.target.value
      }
    }
  }), _vm._v(":\n  "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.contentsInput),
      expression: "contentsInput"
    }],
    staticClass: "monospace",
    attrs: {
      "type": "text"
    },
    domProps: {
      "value": (_vm.contentsInput)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.contentsInput = $event.target.value
      }
    }
  })])
},staticRenderFns: []}

/***/ }),

/***/ 1721:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('b-dropdown', {
    staticClass: "dropdown",
    model: {
      value: (_vm.currentProject),
      callback: function($$v) {
        _vm.currentProject = $$v
      },
      expression: "currentProject"
    }
  }, [_c('button', {
    staticClass: "button is-primary is-small",
    attrs: {
      "slot": "trigger"
    },
    slot: "trigger"
  }, [_c('span', [_vm._v(_vm._s(_vm.currentProject))]), _vm._v(" "), _c('b-icon', {
    attrs: {
      "icon": "angle-down"
    }
  })], 1), _vm._v(" "), _vm._l((_vm.projectNames), function(name, idx) {
    return _c('b-dropdown-item', {
      key: idx,
      attrs: {
        "value": name.value
      }
    }, [_vm._v(_vm._s(name.label))])
  })], 2)
},staticRenderFns: []}

/***/ }),

/***/ 1722:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('li', {
    ref: "menuitem",
    staticClass: "menu-item",
    class: _vm.classes,
    on: {
      "mouseover": _vm.mouseover,
      "click": _vm.clicked
    }
  }, [_c('div', {
    staticClass: "checkmark"
  }), _vm._v(" "), _c('div', {
    staticClass: "context-menu-label"
  }, [_c('span', {
    staticClass: "context-menu-label-text",
    attrs: {
      "title": _vm.tooltip
    }
  }, [_vm._v(_vm._s(_vm.label))])]), _vm._v(" "), _c('div', {
    staticClass: "modifiers"
  }, [_vm._v(_vm._s(_vm.modifiers))])])
},staticRenderFns: []}

/***/ }),

/***/ 1723:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "column control-panel is-6",
    class: {
      focused: _vm.focused
    }
  }, [_c('article', {
    staticClass: "message"
  }, [_c('div', {
    staticClass: "message-header"
  }, [_c('p', [_vm._v(_vm._s(_vm.name))]), _vm._v(" "), _c('button', {
    staticClass: "delete",
    class: {
      pinned: _vm.pinned
    },
    attrs: {
      "title": _vm.pinTitle
    },
    on: {
      "click": _vm.pin
    }
  }, [_c('b-icon', {
    attrs: {
      "icon": "thumb-tack",
      "size": "is-small"
    }
  })], 1)]), _vm._v(" "), _c('div', {
    directives: [{
      name: "bar",
      rawName: "v-bar",
      value: ({
        useScrollbarPseudo: true
      }),
      expression: "{ useScrollbarPseudo: true }"
    }],
    staticClass: "message-body"
  }, [_c('div', {
    staticClass: "pure-form pure-form-aligned"
  }, [_c('module-preset-selector', {
    staticClass: "pure-control-group",
    attrs: {
      "presets": _vm.module.presets || {},
      "moduleName": _vm.name
    }
  }), _vm._v(" "), _vm._l((_vm.controls), function(control) {
    return _c(control.component, {
      key: control.meta.$modv_variable,
      tag: "component",
      staticClass: "pure-control-group",
      attrs: {
        "module": _vm.module,
        "meta": control.meta
      }
    })
  })], 2)])])])
},staticRenderFns: []}

/***/ }),

/***/ 1724:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "checkbox-control",
    attrs: {
      "data-moduleName": _vm.moduleName
    }
  }, [_c('label', {
    attrs: {
      "for": _vm.inputId
    },
    on: {
      "click": _vm.labelClicked
    }
  }, [_vm._v("\n    " + _vm._s(_vm.label) + "\n  ")]), _vm._v(" "), _c('b-checkbox', {
    attrs: {
      "id": _vm.inputId
    },
    model: {
      value: (_vm.value),
      callback: function($$v) {
        _vm.value = $$v
      },
      expression: "value"
    }
  })], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1725:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c("div")
},staticRenderFns: []}

/***/ }),

/***/ 1726:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "modal-card expression-editor"
  }, [_vm._m(0), _vm._v(" "), _c('section', {
    staticClass: "modal-card-body"
  }, [_c('h3', [_vm._v(_vm._s((_vm.moduleName + "." + _vm.controlVariable)))]), _vm._v(" "), _c('button', {
    staticClass: "button",
    on: {
      "click": _vm.addNewScopeItem
    }
  }, [_vm._v("Add item to scope")]), _vm._v(" "), _c('ul', _vm._l((_vm.additionalScope), function(addition, key) {
    return _c('scope-item', {
      key: key,
      attrs: {
        "contents": addition,
        "name": key
      },
      on: {
        "updateName": _vm.updateScopeItemName,
        "updateContents": _vm.updateScopeItemContents
      }
    })
  })), _vm._v(" "), _c('b-field', {
    attrs: {
      "label": "Expression"
    }
  }, [_c('b-input', {
    attrs: {
      "type": "textarea"
    },
    model: {
      value: (_vm.expression),
      callback: function($$v) {
        _vm.expression = $$v
      },
      expression: "expression"
    }
  })], 1)], 1)])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('header', {
    staticClass: "modal-card-head"
  }, [_c('p', {
    staticClass: "modal-card-title"
  }, [_vm._v("Expression editor")])])
}]}

/***/ }),

/***/ 1727:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "module-preset-selector-control"
  }, [_c('b-field', {
    attrs: {
      "label": "Presets",
      "addons": false
    }
  }, [_c('b-dropdown', {
    model: {
      value: (_vm.preset),
      callback: function($$v) {
        _vm.preset = $$v
      },
      expression: "preset"
    }
  }, [_c('button', {
    staticClass: "button is-primary is-small",
    attrs: {
      "slot": "trigger"
    },
    slot: "trigger"
  }, [_c('span', [_vm._v(_vm._s(_vm.preset))]), _vm._v(" "), _c('b-icon', {
    attrs: {
      "icon": "angle-down"
    }
  })], 1), _vm._v(" "), _vm._l((_vm.presets), function(presetData, presetName) {
    return _c('b-dropdown-item', {
      key: presetName,
      attrs: {
        "value": presetName
      }
    }, [_vm._v(_vm._s(presetName))])
  })], 2), _vm._v(" "), _c('button', {
    staticClass: "button is-small",
    on: {
      "click": _vm.load
    }
  }, [_vm._v("Load")])], 1)], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1728:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    ref: "preview",
    staticClass: "canvas-preview"
  }, [_c('output-window-button'), _vm._v(" "), _c('canvas', {
    attrs: {
      "id": "preview-canvas"
    }
  })], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1729:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('b-dropdown', {
    staticClass: "dropdown",
    model: {
      value: (_vm.currentPalette),
      callback: function($$v) {
        _vm.currentPalette = $$v
      },
      expression: "currentPalette"
    }
  }, [_c('button', {
    staticClass: "button is-primary is-small",
    attrs: {
      "slot": "trigger"
    },
    slot: "trigger"
  }, [_c('span', [_vm._v(_vm._s(_vm._f("capitalize")(_vm.currentPalette)))]), _vm._v(" "), _c('b-icon', {
    attrs: {
      "icon": "angle-down"
    }
  })], 1), _vm._v(" "), _vm._l((_vm.selectData), function(data, idx) {
    return _c('b-dropdown-item', {
      key: idx,
      attrs: {
        "value": data.value
      }
    }, [_vm._v(_vm._s(_vm._f("capitalize")(data.label)))])
  })], 2)
},staticRenderFns: []}

/***/ }),

/***/ 1730:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "image-control",
    attrs: {
      "data-moduleName": _vm.moduleName
    }
  }, [_c('label', {
    attrs: {
      "for": _vm.inputId
    }
  }, [_vm._v("\n    " + _vm._s(_vm.label) + "\n  ")]), _vm._v(" "), _c('div', {
    staticClass: "columns is-variable is-2"
  }, [_c('div', {
    staticClass: "column is-6"
  }, [_vm._v("\n      Source:\n      "), _vm._l((_vm.sources), function(sourceName) {
    return _c('div', {
      staticClass: "field"
    }, [_c('b-radio', {
      attrs: {
        "native-value": sourceName
      },
      model: {
        value: (_vm.source),
        callback: function($$v) {
          _vm.source = $$v
        },
        expression: "source"
      }
    }, [_vm._v("\n          " + _vm._s(sourceName) + "\n        ")])], 1)
  })], 2), _vm._v(" "), (_vm.source === 'layer') ? _c('div', {
    staticClass: "column is-6"
  }, [_c('b-dropdown', {
    staticClass: "dropdown",
    attrs: {
      "id": _vm.inputId
    },
    model: {
      value: (_vm.currentLayerIndex),
      callback: function($$v) {
        _vm.currentLayerIndex = $$v
      },
      expression: "currentLayerIndex"
    }
  }, [_c('button', {
    staticClass: "button is-primary is-small",
    attrs: {
      "slot": "trigger"
    },
    slot: "trigger"
  }, [_c('span', [_vm._v(_vm._s(_vm._f("capitalize")(_vm.selectedLabel)))]), _vm._v(" "), _c('b-icon', {
    attrs: {
      "icon": "angle-down"
    }
  })], 1), _vm._v(" "), _vm._l((_vm.layerNames), function(data, idx) {
    return _c('b-dropdown-item', {
      key: idx,
      attrs: {
        "value": data.value
      }
    }, [_vm._v(_vm._s(_vm._f("capitalize")(data.label)))])
  })], 2)], 1) : _vm._e()])])
},staticRenderFns: []}

/***/ }),

/***/ 1731:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "palette-gallery columns is-gapless is-multiline"
  }, [_c('div', {
    staticClass: "column is-12"
  }, _vm._l((_vm.projects), function(project, projectName) {
    return _c('span', [_c('h2', {
      staticClass: "title"
    }, [_vm._v(_vm._s(projectName))]), _vm._v(" "), _c('div', {
      staticClass: "columns is-gapless is-multiline"
    }, _vm._l((project.palettes), function(palette, paletteName) {
      return _c('div', {
        staticClass: "column is-12 palette-container"
      }, [_c('p', {
        staticClass: "has-text-light"
      }, [_vm._v(_vm._s(paletteName))]), _vm._v(" "), _vm._l((palette), function(rgb) {
        return _c('div', {
          staticClass: "swatch",
          style: (_vm.makeStyle(rgb))
        })
      })], 2)
    }))])
  }))])
},staticRenderFns: []}

/***/ }),

/***/ 1732:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('Container', {
    staticClass: "left-topactive-list columns is-gapless is-multiline",
    attrs: {
      "drag-handle-selector": ".layer-handle",
      "lock-axis": "y",
      "group-name": "layers",
      "should-animate-drop": function () { return false; },
      "tag": "div"
    },
    on: {
      "drop": _vm.onDrop
    }
  }, _vm._l((_vm.layers), function(layer, index) {
    return _c('Draggable', {
      key: index,
      staticClass: "column is-12"
    }, [_c('layer', {
      attrs: {
        "Layer": layer,
        "LayerIndex": index
      }
    })], 1)
  }))
},staticRenderFns: []}

/***/ }),

/***/ 1733:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "gallery columns is-gapless"
  }, [_c('div', {
    staticClass: "column is-12"
  }, [_c('search-bar', {
    staticClass: "search-bar-wrapper",
    attrs: {
      "phrase": _vm.phrase
    },
    on: {
      "update:phrase": function($event) {
        _vm.phrase = $event
      },
      "menuIconClicked": _vm.menuIconClicked
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "column is-12 full-height"
  }, [_c('b-tabs', {
    staticClass: "make-flex-fit",
    attrs: {
      "animated": false
    }
  }, [_c('b-tab-item', {
    directives: [{
      name: "bar",
      rawName: "v-bar",
      value: ({
        useScrollbarPseudo: true
      }),
      expression: "{ useScrollbarPseudo: true }"
    }],
    staticClass: "make-flex-fit",
    attrs: {
      "label": "Modules"
    }
  }, [_c('module-gallery', {
    attrs: {
      "phrase": _vm.phrase
    }
  })], 1), _vm._v(" "), _c('b-tab-item', {
    directives: [{
      name: "bar",
      rawName: "v-bar",
      value: ({
        useScrollbarPseudo: true
      }),
      expression: "{ useScrollbarPseudo: true }"
    }],
    attrs: {
      "label": "Presets"
    }
  }, [_c('preset-gallery', {
    attrs: {
      "phrase": _vm.phrase
    }
  })], 1), _vm._v(" "), _c('b-tab-item', {
    directives: [{
      name: "bar",
      rawName: "v-bar",
      value: ({
        useScrollbarPseudo: true
      }),
      expression: "{ useScrollbarPseudo: true }"
    }],
    attrs: {
      "label": "Palettes"
    }
  }, [_c('palette-gallery', {
    attrs: {
      "phrase": _vm.phrase
    }
  })], 1), _vm._v(" "), _c('b-tab-item', {
    attrs: {
      "label": "Images",
      "disabled": ""
    }
  }), _vm._v(" "), _c('b-tab-item', {
    attrs: {
      "label": "Videos",
      "disabled": ""
    }
  }), _vm._v(" "), _c('b-tab-item', {
    directives: [{
      name: "bar",
      rawName: "v-bar",
      value: ({
        useScrollbarPseudo: true
      }),
      expression: "{ useScrollbarPseudo: true }"
    }],
    attrs: {
      "label": "Plugins"
    }
  }, [_c('plugin-gallery', {
    attrs: {
      "phrase": _vm.phrase
    }
  })], 1), _vm._v(" "), _c('b-tab-item', {
    directives: [{
      name: "bar",
      rawName: "v-bar",
      value: ({
        useScrollbarPseudo: true
      }),
      expression: "{ useScrollbarPseudo: true }"
    }],
    attrs: {
      "label": "Projects"
    }
  }, [_c('project-gallery', {
    attrs: {
      "phrase": _vm.phrase
    }
  })], 1), _vm._v(" "), _vm._l((_vm.enabledPlugins), function(plugin, pluginName) {
    return _c('b-tab-item', {
      key: pluginName,
      attrs: {
        "label": pluginName
      }
    }, [_c(plugin.plugin.galleryTabComponent.name, {
      tag: "component"
    })], 1)
  })], 2)], 1)])
},staticRenderFns: []}

/***/ }),

/***/ 1734:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    directives: [{
      name: "shortkey",
      rawName: "v-shortkey",
      value: (['esc']),
      expression: "['esc']"
    }],
    staticClass: "search-bar-container",
    on: {
      "shortkey": _vm.clearSearch
    }
  }, [_c('b-input', {
    directives: [{
      name: "shortkey",
      rawName: "v-shortkey.focus",
      value: (['ctrl', 'f']),
      expression: "['ctrl', 'f']",
      modifiers: {
        "focus": true
      }
    }],
    ref: "gallery-search",
    attrs: {
      "icon": "search",
      "type": "text",
      "placeholder": "Search Gallery",
      "id": "gallery-search"
    },
    on: {
      "shortkey": _vm.focus
    },
    model: {
      value: (_vm.phrase),
      callback: function($$v) {
        _vm.phrase = $$v
      },
      expression: "phrase"
    }
  }), _vm._v(" "), _c('i', {
    staticClass: "fa fa-bars fa-2x",
    attrs: {
      "aria-hidden": "true"
    },
    on: {
      "click": _vm.menuIconClicked
    }
  })], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1735:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "color-control",
    attrs: {
      "data-moduleName": _vm.moduleName
    }
  }, [_c('label', {
    attrs: {
      "for": _vm.inputId
    }
  }, [_vm._v("\n    " + _vm._s(_vm.label) + "\n  ")]), _vm._v(" "), _c('sketch-picker', {
    ref: "colorPicker",
    attrs: {
      "id": _vm.inputId
    },
    model: {
      value: (_vm.value),
      callback: function($$v) {
        _vm.value = $$v
      },
      expression: "value"
    }
  })], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1736:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('button', {
    staticClass: "button is-primary is-small",
    attrs: {
      "title": "Remove Focused Layer"
    },
    on: {
      "click": _vm.removeFocusedLayer
    }
  }, [_c('b-icon', {
    attrs: {
      "icon": "trash"
    }
  })], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1737:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "tabs"
  }, [_c('div', {
    staticClass: "tab-menu"
  }, _vm._l((_vm.amount), function(i) {
    return _c('div', {
      staticClass: "tab",
      class: {
        'selected': _vm.focusedTabIndex === i
      },
      style: (("width: " + (100 / _vm.amount) + "%")),
      on: {
        "click": function($event) {
          _vm.focusTab(i)
        }
      }
    }, [_vm._v("\n      " + _vm._s(_vm.titles[i - 1]) + "\n    ")])
  })), _vm._v(" "), _c('div', {
    staticClass: "tab-contents",
    attrs: {
      "data-simplebar-direction": "vertical"
    }
  }, _vm._l((_vm.amount), function(i) {
    return _c('div', {
      staticClass: "tab-content",
      class: {
        show: _vm.focusedTabIndex === i
      }
    }, [_vm._t(("tab-" + i))], 2)
  }))])
},staticRenderFns: []}

/***/ }),

/***/ 1738:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('input', {
    staticClass: "input",
    attrs: {
      "type": "text"
    },
    on: {
      "keypress": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key)) { return null; }
        _vm.search($event)
      }
    }
  }), _vm._v(" "), _c('ul', _vm._l((_vm.results), function(result) {
    return _c('li', {
      staticClass: "is-light",
      on: {
        "click": function($event) {
          _vm.makeModule(result)
        }
      }
    }, [_vm._v(_vm._s(result.info.name))])
  }))])
},staticRenderFns: []}

/***/ }),

/***/ 1739:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "layer-item",
    class: {
      active: _vm.focusedLayerIndex === _vm.LayerIndex,
        locked: _vm.locked,
        collapsed: _vm.collapsed
    },
    on: {
      "click": _vm.focusLayer
    }
  }, [_c('div', {
    staticClass: "columns is-gapless is-multiline is-mobile"
  }, [_c('div', {
    staticClass: "column is-12"
  }, [_c('div', {
    directives: [{
      name: "context-menu",
      rawName: "v-context-menu",
      value: (_vm.menuOptions),
      expression: "menuOptions"
    }],
    staticClass: "control-bar layer-handle columns is-gapless is-mobile"
  }, [_c('div', {
    staticClass: "column is-three-quarters"
  }, [_c('div', {
    staticClass: "layer-title",
    on: {
      "dblclick": _vm.startNameEdit,
      "keydown": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key)) { return null; }
        _vm.stopNameEdit($event)
      }
    }
  }, [_vm._v(_vm._s(_vm.name))])]), _vm._v(" "), _c('div', {
    staticClass: "column is-one-quarter layer-item-controls"
  }, [_c('div', {
    staticClass: "ibvf"
  }), _vm._v(" "), _c('div', {
    staticClass: "lock",
    on: {
      "click": _vm.clickToggleLock
    }
  }, [_c('i', {
    staticClass: "fa fa-unlock-alt"
  }), _vm._v(" "), _c('i', {
    staticClass: "fa fa-lock"
  })]), _vm._v(" "), _c('div', {
    staticClass: "collapse",
    on: {
      "click": _vm.clickToggleCollapse
    }
  }, [_c('i', {
    staticClass: "fa fa-toggle-down"
  }), _vm._v(" "), _c('i', {
    staticClass: "fa fa-toggle-up"
  })])])])]), _vm._v(" "), _c('div', {
    staticClass: "column is-12"
  }, [_c('Container', {
    staticClass: "module-list columns is-gapless is-mobile",
    attrs: {
      "drag-handle-selector": ".active-module-handle",
      "lock-axis": "y",
      "group-name": "modules",
      "should-animate-drop": function () { return false; },
      "get-child-payload": _vm.getChildPayload,
      "tag": "div"
    },
    on: {
      "drop": _vm.onDrop
    }
  }, _vm._l((_vm.modules), function(module) {
    return _c('Draggable', {
      key: module,
      staticClass: "column",
      attrs: {
        "tabindex": "0"
      }
    }, [_c('active-module', {
      attrs: {
        "moduleName": module
      },
      nativeOn: {
        "dragstart": function($event) {
          _vm.dragstart($event)
        }
      }
    })], 1)
  }))], 1)])])
},staticRenderFns: []}

/***/ }),

/***/ 1740:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "preset-gallery columns is-gapless is-multiline"
  }, [_c('div', {
    staticClass: "column is-12"
  }, [_c('div', {
    staticClass: "columns"
  }, [_c('div', {
    staticClass: "column is-2 flex-center"
  }, [_vm._v("Create new:")]), _vm._v(" "), _c('div', {
    staticClass: "column is-8"
  }, [_c('b-input', {
    attrs: {
      "placeholder": "Project name"
    },
    model: {
      value: (_vm.newProjectName),
      callback: function($$v) {
        _vm.newProjectName = $$v
      },
      expression: "newProjectName"
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "column is-2"
  }, [_c('button', {
    staticClass: "button is-light",
    on: {
      "click": _vm.newProject
    }
  }, [_vm._v("Create")])])])]), _vm._v(" "), _vm._l((_vm.projects), function(projectName) {
    return _c('div', {
      staticClass: "column is-12 preset-container"
    }, [_c('div', {
      staticClass: "columns"
    }, [_c('div', {
      staticClass: "column is-10"
    }, [_c('span', {
      staticClass: "has-text-light"
    }, [_vm._v(_vm._s(projectName))])]), _vm._v(" "), _c('div', {
      staticClass: "column is-2"
    }, [_c('button', {
      staticClass: "button is-dark is-inverted is-outlined",
      attrs: {
        "disabled": !_vm.isCurrent(projectName)
      },
      on: {
        "click": function($event) {
          _vm.useProject({
            projectName: projectName
          })
        }
      }
    }, [_vm._v(_vm._s(_vm.isCurrent(projectName) ? 'Use' : 'In use'))])])])])
  })], 2)
},staticRenderFns: []}

/***/ }),

/***/ 1741:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "container"
  }, [_c('h1', {
    staticClass: "title"
  }, [_vm._v("Options")]), _vm._v(" "), _c('div', {
    staticClass: "columns is-multiline"
  }, [_c('div', {
    staticClass: "column is-4"
  }, [_c('div', {
    staticClass: "card"
  }, [_c('p', {
    staticClass: "card-header-title"
  }, [_vm._v("\n          Input\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "card-content"
  }, [_c('div', {
    staticClass: "content"
  }, [_c('div', {
    staticClass: "field"
  }, [_vm._v("\n              Audio input:\n              "), _c('b-select', {
    attrs: {
      "placeholder": "Select an input"
    },
    model: {
      value: (_vm.audioSource),
      callback: function($$v) {
        _vm.audioSource = $$v
      },
      expression: "audioSource"
    }
  }, _vm._l((_vm.audioSources), function(source) {
    return _c('option', {
      domProps: {
        "value": source.deviceId
      }
    }, [_vm._v(_vm._s(source.label))])
  }))], 1), _vm._v(" "), _c('div', {
    staticClass: "field"
  }, [_vm._v("\n              Video input:\n              "), _c('b-select', {
    attrs: {
      "placeholder": "Select an input"
    },
    model: {
      value: (_vm.videoSource),
      callback: function($$v) {
        _vm.videoSource = $$v
      },
      expression: "videoSource"
    }
  }, _vm._l((_vm.videoSources), function(source) {
    return _c('option', {
      domProps: {
        "value": source.deviceId
      }
    }, [_vm._v(_vm._s(source.label))])
  }))], 1)])])])]), _vm._v(" "), _c('div', {
    staticClass: "column is-4"
  }, [_c('div', {
    staticClass: "card"
  }, [_c('p', {
    staticClass: "card-header-title"
  }, [_vm._v("\n          Output\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "card-content"
  }, [_c('div', {
    staticClass: "content"
  }, [_c('div', {
    staticClass: "field"
  }, [_c('b-checkbox', {
    model: {
      value: (_vm.retina),
      callback: function($$v) {
        _vm.retina = $$v
      },
      expression: "retina"
    }
  }, [_vm._v("Use retina resolutions (*" + _vm._s(_vm.devicePixelRatio) + ")")])], 1), _vm._v(" "), _c('div', {
    staticClass: "field"
  }, [_c('b-checkbox', {
    model: {
      value: (_vm.constrainToOneOne),
      callback: function($$v) {
        _vm.constrainToOneOne = $$v
      },
      expression: "constrainToOneOne"
    }
  }, [_vm._v("Constrain output to 1:1 ratio")])], 1)])])])]), _vm._v(" "), _c('div', {
    staticClass: "column is-4"
  }, [_c('div', {
    staticClass: "card"
  }, [_c('p', {
    staticClass: "card-header-title"
  }, [_vm._v("\n          BPM\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "card-content"
  }, [_c('div', {
    staticClass: "content"
  }, [_c('div', {
    staticClass: "field"
  }, [_c('b-checkbox', {
    model: {
      value: (_vm.detect),
      callback: function($$v) {
        _vm.detect = $$v
      },
      expression: "detect"
    }
  }, [_vm._v("Detect BPM")])], 1), _vm._v(" "), _c('div', {
    staticClass: "field"
  }, [_c('button', {
    staticClass: "button",
    attrs: {
      "disabled": _vm.detect
    },
    on: {
      "click": _vm.tempoTap
    }
  }, [_vm._v("\n                Tap Tempo (" + _vm._s(parseInt(_vm.bpm, 10)) + ")\n              ")])])])])])]), _vm._v(" "), _c('div', {
    staticClass: "column is-4"
  }, [_c('div', {
    staticClass: "card"
  }, [_c('p', {
    staticClass: "card-header-title"
  }, [_vm._v("\n          User\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "card-content"
  }, [_c('div', {
    staticClass: "content"
  }, [_c('b-field', {
    attrs: {
      "label": "Set Username"
    }
  }, [_c('b-input', {
    on: {
      "keypress": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key)) { return null; }
        _vm.saveName($event)
      }
    },
    model: {
      value: (_vm.nameInput),
      callback: function($$v) {
        _vm.nameInput = $$v
      },
      expression: "nameInput"
    }
  }), _vm._v(" "), _c('p', {
    staticClass: "control"
  }, [_c('button', {
    staticClass: "button is-primary",
    on: {
      "click": function($event) {
        _vm.saveName(_vm.nameInput)
      }
    }
  }, [_vm._v("Save")])])], 1)], 1)])])])])])
},staticRenderFns: []}

/***/ }),

/***/ 1742:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('b-field', {
    staticClass: "has-text-light",
    attrs: {
      "label": "Selection X"
    }
  }, [_c('b-input', {
    attrs: {
      "type": "number"
    },
    model: {
      value: (_vm.x),
      callback: function($$v) {
        _vm.x = $$v
      },
      expression: "x"
    }
  })], 1), _vm._v(" "), _c('b-field', {
    staticClass: "has-text-light",
    attrs: {
      "label": "Selection Y"
    }
  }, [_c('b-input', {
    attrs: {
      "type": "number"
    },
    model: {
      value: (_vm.y),
      callback: function($$v) {
        _vm.y = $$v
      },
      expression: "y"
    }
  })], 1), _vm._v(" "), _c('b-field', {
    staticClass: "has-text-light",
    attrs: {
      "label": "Luminave URL"
    }
  }, [_c('b-input', {
    attrs: {
      "type": "string"
    },
    model: {
      value: (_vm.url),
      callback: function($$v) {
        _vm.url = $$v
      },
      expression: "url"
    }
  })], 1), _vm._v(" "), _c('button', {
    staticClass: "button",
    on: {
      "click": function($event) {
        _vm.showCanvas = !_vm.showCanvas
      }
    }
  }, [_vm._v("\n    " + _vm._s(_vm.showCanvas ? 'Hide ' : 'Show ') + "Canvas\n  ")])], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1743:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    directives: [{
      name: "context-menu",
      rawName: "v-context-menu",
      value: (_vm.menuOptions),
      expression: "menuOptions"
    }],
    staticClass: "text-control",
    attrs: {
      "data-moduleName": _vm.moduleName
    }
  }, [_c('b-field', {
    attrs: {
      "label": _vm.label
    }
  }, [_c('b-input', {
    attrs: {
      "type": "text"
    },
    model: {
      value: (_vm.value),
      callback: function($$v) {
        _vm.value = $$v
      },
      expression: "value"
    }
  })], 1)], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1744:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "column is-12 columns is-mobile is-multiline"
  }, _vm._l((_vm.panels), function(moduleName) {
    return _c('control-panel', {
      key: moduleName,
      attrs: {
        "moduleName": moduleName,
        "pinned": _vm.isPinned(moduleName),
        "focused": _vm.isFocused(moduleName)
      }
    })
  }))
},staticRenderFns: []}

/***/ }),

/***/ 1745:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "preset-gallery columns is-gapless is-multiline"
  }, [_c('div', {
    staticClass: "column is-12"
  }, [_c('h2', {
    staticClass: "title"
  }, [_vm._v("Save preset")]), _vm._v(" "), _c('div', {
    staticClass: "columns"
  }, [_c('div', {
    staticClass: "column is-10"
  }, [_c('b-field', {
    attrs: {
      "type": _vm.nameError ? 'is-danger' : '',
      "message": _vm.nameError ? _vm.nameErrorMessage : ''
    }
  }, [_c('b-input', {
    attrs: {
      "placeholder": "Preset name"
    },
    model: {
      value: (_vm.newPresetName),
      callback: function($$v) {
        _vm.newPresetName = $$v
      },
      expression: "newPresetName"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "column is-2"
  }, [_c('div', {
    staticClass: "field"
  }, [_c('div', {
    staticClass: "control"
  }, [_c('button', {
    staticClass: "button",
    on: {
      "click": _vm.savePreset
    }
  }, [_vm._v("Save")])])])])])]), _vm._v(" "), _c('div', {
    staticClass: "column is-12"
  }, _vm._l((_vm.project), function(preset, presetName) {
    return _c('div', {
      staticClass: "column is-12 preset-container"
    }, [(!_vm.validateModuleRequirements(preset.moduleData)) ? _c('div', {
      staticClass: "columns cannot-load"
    }, [_c('div', {
      staticClass: "column is-10"
    }, [_c('span', {
      staticClass: "has-text-grey"
    }, [_vm._v(_vm._s(preset.presetInfo.name))])]), _vm._v(" "), _c('div', {
      staticClass: "column is-2"
    }, [_c('b-tooltip', {
      attrs: {
        "label": "Missing modules",
        "type": "is-danger",
        "position": "is-left"
      }
    }, [_c('button', {
      staticClass: "button is-dark",
      attrs: {
        "disabled": ""
      }
    }, [_vm._v("Load")])])], 1)]) : _c('div', {
      staticClass: "columns"
    }, [_c('div', {
      staticClass: "column is-10"
    }, [_c('span', {
      staticClass: "has-text-light"
    }, [_vm._v(_vm._s(preset.presetInfo.name))])]), _vm._v(" "), _c('div', {
      staticClass: "column is-2"
    }, [_c('button', {
      staticClass: "button is-dark is-inverted is-outlined",
      class: {
        'is-loading': _vm.loading === (_vm.currentProjectName + "." + (preset.presetInfo.name))
      },
      on: {
        "click": function($event) {
          _vm.loadPreset({
            presetName: preset.presetInfo.name
          })
        }
      }
    }, [_vm._v("Load")])])])])
  }))])
},staticRenderFns: []}

/***/ }),

/***/ 1746:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    attrs: {
      "id": "app"
    }
  }, [_c('section', {
    staticClass: "section"
  }, [_c('div', {
    staticClass: "top"
  }, [_c('div', {
    staticClass: "columns is-gapless is-mobile"
  }, [_c('div', {
    staticClass: "column is-3 active-list-wrapper"
  }, [_c('div', {
    directives: [{
      name: "bar",
      rawName: "v-bar",
      value: ({
        useScrollbarPseudo: true
      }),
      expression: "{ useScrollbarPseudo: true }"
    }]
  }, [_c('list')], 1), _vm._v(" "), _c('layer-menu')], 1), _vm._v(" "), _c('div', {
    staticClass: "column gallery-wrapper"
  }, [_c('gallery', {
    on: {
      "menuIconClicked": _vm.menuIconClicked
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "resize-handle-left"
  })], 1)])]), _vm._v(" "), _c('div', {
    directives: [{
      name: "bar",
      rawName: "v-bar",
      value: ({
        useScrollbarPseudo: true
      }),
      expression: "{ useScrollbarPseudo: true }"
    }],
    staticClass: "bottom"
  }, [_c('div', {
    staticClass: "bottom-inner columns is-gapless is-mobile is-multiline"
  }, [_c('div', {
    staticClass: "column is-9"
  }, [_c('div', {
    staticClass: "control-panel-wrapper columns is-gapless is-mobile module-controls-wrapper"
  }, [_c('control-panel-handler')], 1)]), _vm._v(" "), _c('div', {
    staticClass: "column is-3 main-control-area"
  }, [_c('div', {
    staticClass: "control-panel-wrapper columns is-gapless is-mobile layer-controls-wrapper"
  }, [_c('layer-controls')], 1)])]), _vm._v(" "), _c('div', {
    staticClass: "resize-handle-top"
  })])]), _vm._v(" "), _c('canvas-preview'), _vm._v(" "), _c('side-menu', {
    attrs: {
      "menuState": _vm.menuOpen
    }
  }), _vm._v(" "), _c('status-bar'), _vm._v(" "), _vm._l((_vm.pluginComponents), function(pluginComponent) {
    return _c(pluginComponent, {
      key: pluginComponent,
      tag: "component"
    })
  })], 2)
},staticRenderFns: []}

/***/ }),

/***/ 1747:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "status-bar tags"
  }, [_c('span', {
    staticClass: "tag",
    on: {
      "dblclick": function($event) {
        _vm.sizeModalOpen = true
      }
    }
  }, [_vm._v(_vm._s(_vm.sizeOut))]), _vm._v(" "), _c('span', {
    staticClass: "tag"
  }, [_vm._v("layers: " + _vm._s(_vm.allLayers.length))]), _vm._v(" "), _c('span', {
    staticClass: "tag"
  }, [_vm._v("modules: " + _vm._s(_vm.nonGalleryModules))]), _vm._v(" "), _c('span', {
    staticClass: "tag"
  }, [_vm._v("bpm: " + _vm._s(_vm.bpm) + " " + _vm._s(_vm.detect ? '🤖' : ''))]), _vm._v(" "), _c('project-item'), _vm._v(" "), _c('b-modal', {
    attrs: {
      "active": _vm.sizeModalOpen
    },
    on: {
      "update:active": function($event) {
        _vm.sizeModalOpen = $event
      }
    }
  }, [_c('div', [_c('b-input', {
    attrs: {
      "type": "number"
    },
    model: {
      value: (_vm.width),
      callback: function($$v) {
        _vm.width = _vm._n($$v)
      },
      expression: "width"
    }
  }), _vm._v("\n      𝗑\n      "), _c('b-input', {
    attrs: {
      "type": "number"
    },
    model: {
      value: (_vm.height),
      callback: function($$v) {
        _vm.height = _vm._n($$v)
      },
      expression: "height"
    }
  }), _vm._v(" "), _c('button', {
    staticClass: "button",
    on: {
      "click": _vm.setWindowSize
    }
  }, [_vm._v("Set window size")])], 1)])], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1748:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "active-item",
    class: {
      current: _vm.focused
    },
    attrs: {
      "tabindex": "0"
    },
    on: {
      "focus": _vm.focusActiveModule,
      "keyup": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "delete", [8, 46], $event.key)) { return null; }
        _vm.deletePress($event)
      }
    }
  }, [_c('div', {
    staticClass: "active-module-wrapper columns is-gapless is-mobile"
  }, [_c('div', {
    staticClass: "column is-10"
  }, [_c('div', {
    staticClass: "columns is-gapless is-mobile"
  }, [_c('div', {
    staticClass: "column is-12"
  }, [_c('span', {
    staticClass: "active-item-title"
  }, [_vm._v(_vm._s(_vm.moduleName))]), _vm._v(" "), _c('div', {
    staticClass: "columns is-gapless is-mobile"
  }, [_c('div', {
    staticClass: "column options"
  }, [_c('b-field', {
    directives: [{
      name: "context-menu",
      rawName: "v-context-menu",
      value: (_vm.checkboxMenuOptions),
      expression: "checkboxMenuOptions"
    }],
    attrs: {
      "horizontal": "",
      "for": _vm.enabledCheckboxId,
      "label": "Enabled"
    },
    nativeOn: {
      "click": function($event) {
        _vm.checkboxClick($event)
      }
    }
  }, [_c('b-checkbox', {
    attrs: {
      "id": _vm.enabledCheckboxId
    },
    model: {
      value: (_vm.enabled),
      callback: function($$v) {
        _vm.enabled = $$v
      },
      expression: "enabled"
    }
  })], 1), _vm._v(" "), _c('opacity-control', {
    directives: [{
      name: "context-menu",
      rawName: "v-context-menu",
      value: (_vm.opacityMenuOptions),
      expression: "opacityMenuOptions"
    }],
    attrs: {
      "module-name": _vm.moduleName
    }
  }), _vm._v(" "), _c('b-field', {
    attrs: {
      "horizontal": "",
      "label": "Blending"
    }
  }, [_c('b-select', {
    staticClass: "dropdown",
    attrs: {
      "size": "is-small"
    },
    model: {
      value: (_vm.compositeOperation),
      callback: function($$v) {
        _vm.compositeOperation = $$v
      },
      expression: "compositeOperation"
    }
  }, [_c('option', {
    attrs: {
      "disabled": true
    }
  }, [_vm._v(_vm._s(_vm.blendModes.label))]), _vm._v(" "), _vm._l((_vm.blendModes.children), function(item) {
    return _c('option', {
      key: item.value,
      domProps: {
        "value": item.value
      }
    }, [_vm._v(_vm._s(item.label))])
  }), _vm._v(" "), _c('hr', {
    staticClass: "dropdown-divider"
  }), _vm._v(" "), _c('option', {
    attrs: {
      "disabled": true
    }
  }, [_vm._v(_vm._s(_vm.compositeOperations.label))]), _vm._v(" "), _vm._l((_vm.compositeOperations.children), function(item) {
    return _c('option', {
      key: item.value,
      domProps: {
        "value": item.value
      }
    }, [_vm._v(_vm._s(item.label))])
  })], 2)], 1)], 1)])])])]), _vm._v(" "), _vm._m(0)])])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "column is-2 handle-container"
  }, [_c('i', {
    staticClass: "active-module-handle handle fa fa-reorder fa-3x"
  })])
}]}

/***/ }),

/***/ 1749:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "module-gallery columns is-multiline"
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.phrase.length > 0),
      expression: "phrase.length > 0"
    }],
    staticClass: "column is-12 title"
  }, [_c('h2', [_vm._v("All Modules")])]), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.phrase.length > 0),
      expression: "phrase.length > 0"
    }],
    staticClass: "column is-12"
  }, [_c('Container', {
    staticClass: "columns is-multiline is-mobile is-variable is-1",
    attrs: {
      "behaviour": "copy",
      "group-name": "modules",
      "get-child-payload": function (e) { return _vm.getChildPayload('modules', e); },
      "tag": "div"
    }
  }, _vm._l((_vm.modules), function(module, key) {
    return _c('Draggable', {
      key: key,
      staticClass: "column is-3",
      class: {
        hidden: !_vm.search(key, _vm.phrase)
      }
    }, [_vm._o(_c('gallery-item', {
      attrs: {
        "module-in": module,
        "module-name": key
      }
    }), 0, key)], 1)
  }))], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.phrase.length < 1),
      expression: "phrase.length < 1"
    }],
    staticClass: "column is-12 title"
  }, [_c('h2', [_vm._v("Module 2D")])]), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.phrase.length < 1),
      expression: "phrase.length < 1"
    }],
    staticClass: "column is-12"
  }, [_c('Container', {
    staticClass: "columns is-multiline is-mobile is-variable is-1",
    attrs: {
      "behaviour": "copy",
      "group-name": "modules",
      "get-child-payload": function (e) { return _vm.getChildPayload('module2d', e); },
      "tag": "div"
    }
  }, _vm._l((_vm.module2d), function(moduleName) {
    return _c('Draggable', {
      key: moduleName,
      staticClass: "column is-3"
    }, [_vm._o(_c('gallery-item', {
      attrs: {
        "module-name": moduleName
      }
    }), 1, moduleName)], 1)
  }))], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.phrase.length < 1),
      expression: "phrase.length < 1"
    }],
    staticClass: "column is-12 title"
  }, [_c('h2', [_vm._v("Module Shader")])]), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.phrase.length < 1),
      expression: "phrase.length < 1"
    }],
    staticClass: "column is-12"
  }, [_c('Container', {
    staticClass: "columns is-multiline is-mobile is-variable is-1",
    attrs: {
      "behaviour": "copy",
      "group-name": "modules",
      "get-child-payload": function (e) { return _vm.getChildPayload('moduleShader', e); },
      "tag": "div"
    }
  }, _vm._l((_vm.moduleShader), function(moduleName) {
    return _c('Draggable', {
      key: moduleName,
      staticClass: "column is-3"
    }, [_vm._o(_c('gallery-item', {
      attrs: {
        "module-name": moduleName
      }
    }), 2, moduleName)], 1)
  }))], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.phrase.length < 1),
      expression: "phrase.length < 1"
    }],
    staticClass: "column is-12 title"
  }, [_c('h2', [_vm._v("Module ISF")])]), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.phrase.length < 1),
      expression: "phrase.length < 1"
    }],
    staticClass: "column is-12"
  }, [_c('Container', {
    staticClass: "columns is-multiline is-mobile is-variable is-1",
    attrs: {
      "behaviour": "copy",
      "group-name": "modules",
      "get-child-payload": function (e) { return _vm.getChildPayload('moduleIsf', e); },
      "tag": "div"
    }
  }, _vm._l((_vm.moduleIsf), function(moduleName) {
    return _c('Draggable', {
      key: moduleName,
      staticClass: "column is-3"
    }, [_vm._o(_c('gallery-item', {
      attrs: {
        "module-name": moduleName
      }
    }), 3, moduleName)], 1)
  }))], 1)])
},staticRenderFns: []}

/***/ }),

/***/ 1750:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "palette-control",
    attrs: {
      "data-moduleName": _vm.moduleName
    }
  }, [_c('div', {
    staticClass: "pure-control-group"
  }, [_c('label', {
    attrs: {
      "for": _vm.inputId
    }
  }, [_vm._v("\n      " + _vm._s(_vm.label) + "\n    ")]), _vm._v(" "), _c('draggable', {
    staticClass: "palette",
    attrs: {
      "options": _vm.dragOptions
    },
    model: {
      value: (_vm.colors),
      callback: function($$v) {
        _vm.colors = $$v
      },
      expression: "colors"
    }
  }, _vm._l((_vm.colors), function(color, idx) {
    return _c('div', {
      staticClass: "swatch",
      class: {
        current: _vm.currentColor === idx || _vm.toColor === idx
      },
      style: ({
        backgroundColor: ("rgb(" + (color.r) + "," + (color.g) + "," + (color.b) + ")"),
        transitionDuration: ((_vm.duration / _vm.colors.length) + "ms"),
      }),
      on: {
        "click": function($event) {
          _vm.removeSwatch(idx)
        }
      }
    })
  })), _vm._v(" "), _c('div', {
    staticClass: "add-swatch",
    on: {
      "click": _vm.addSwatch
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "pure-form-message-inline"
  }, [_c('button', {
    staticClass: "pure-button",
    on: {
      "click": _vm.togglePicker
    }
  }, [_vm._v(_vm._s(_vm.pickerButtonText) + " picker")])])], 1), _vm._v(" "), _c('div', {
    staticClass: "picker-wrapper"
  }, [_c('sketch-picker', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.showPicker),
      expression: "showPicker"
    }],
    model: {
      value: (_vm.pickerColors),
      callback: function($$v) {
        _vm.pickerColors = $$v
      },
      expression: "pickerColors"
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "pure-control-group"
  }, [_c('label', {
    attrs: {
      "for": (_vm.inputId + "-duration")
    }
  }, [_vm._v("Duration")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.durationInput),
      expression: "durationInput"
    }],
    attrs: {
      "id": (_vm.inputId + "-duration"),
      "type": "range",
      "max": "1000",
      "min": "2",
      "disabled": _vm.useBpmInput
    },
    domProps: {
      "value": (_vm.durationInput)
    },
    on: {
      "__r": function($event) {
        _vm.durationInput = $event.target.value
      }
    }
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.durationInput),
      expression: "durationInput"
    }],
    staticClass: "pure-form-message-inline",
    attrs: {
      "type": "number",
      "min": "2",
      "step": "any",
      "disabled": _vm.useBpmInput
    },
    domProps: {
      "value": (_vm.durationInput)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.durationInput = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "pure-control-group"
  }, [_c('label', {
    attrs: {
      "for": (_vm.inputId + "-useBpm")
    }
  }, [_vm._v("Sync duration to BPM")]), _vm._v(" "), _c('b-checkbox', {
    attrs: {
      "id": (_vm.inputId + "-useBpm")
    },
    model: {
      value: (_vm.useBpmInput),
      callback: function($$v) {
        _vm.useBpmInput = $$v
      },
      expression: "useBpmInput"
    }
  })], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.useBpmInput),
      expression: "useBpmInput"
    }],
    staticClass: "pure-control-group"
  }, [_c('label', {
    attrs: {
      "for": (_vm.inputId + "-bpmDivision")
    }
  }, [_vm._v("BPM Division")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.bpmDivisionInput),
      expression: "bpmDivisionInput"
    }],
    attrs: {
      "id": (_vm.inputId + "-bpmDivision"),
      "type": "range",
      "max": "32",
      "min": "1",
      "step": "1"
    },
    domProps: {
      "value": (_vm.bpmDivisionInput)
    },
    on: {
      "__r": function($event) {
        _vm.bpmDivisionInput = $event.target.value
      }
    }
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.bpmDivisionInput),
      expression: "bpmDivisionInput"
    }],
    staticClass: "pure-form-message-inline",
    attrs: {
      "type": "number",
      "min": "1",
      "step": "1"
    },
    domProps: {
      "value": (_vm.bpmDivisionInput)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.bpmDivisionInput = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "pure-control-group"
  }, [_c('label', {
    attrs: {
      "for": (_vm.inputId + "-load-palette")
    }
  }, [_vm._v("Project")]), _vm._v(" "), _c('project-selector', {
    attrs: {
      "id": (_vm.inputId + "-project")
    },
    model: {
      value: (_vm.projectSelectorInput),
      callback: function($$v) {
        _vm.projectSelectorInput = $$v
      },
      expression: "projectSelectorInput"
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "pure-control-group"
  }, [_c('label', {
    attrs: {
      "for": (_vm.inputId + "-load-palette")
    }
  }, [_vm._v("Load Palette")]), _vm._v(" "), _c('palette-selector', {
    attrs: {
      "project": _vm.projectSelectorInput,
      "id": (_vm.inputId + "-load-palette")
    },
    model: {
      value: (_vm.paletteSelectorInput),
      callback: function($$v) {
        _vm.paletteSelectorInput = $$v
      },
      expression: "paletteSelectorInput"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "pure-form-message-inline"
  }, [_c('button', {
    staticClass: "pure-button",
    on: {
      "click": _vm.clickLoadPalette
    }
  }, [_vm._v("Load")])])], 1), _vm._v(" "), _c('div', {
    staticClass: "pure-control-group"
  }, [_c('label', {
    attrs: {
      "for": (_vm.inputId + "-save-palette")
    }
  }, [_vm._v("Save Palette")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.savePaletteNameInput),
      expression: "savePaletteNameInput"
    }],
    attrs: {
      "id": (_vm.inputId + "-save-palette"),
      "type": "text"
    },
    domProps: {
      "value": (_vm.savePaletteNameInput)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.savePaletteNameInput = $event.target.value
      }
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "pure-form-message-inline"
  }, [_c('button', {
    staticClass: "pure-button",
    on: {
      "click": _vm.clickSavePalette
    }
  }, [_vm._v("Save")])])])])
},staticRenderFns: []}

/***/ }),

/***/ 1751:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "canvas-preview-output",
    on: {
      "click": _vm.createWindow
    }
  }, [_c('i', {
    staticClass: "fa fa-external-link"
  }), _vm._v(" "), _c('span', {
    staticClass: "canvas-preview-output-text"
  }, [_vm._v("Output Window")])])
},staticRenderFns: []}

/***/ }),

/***/ 1752:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('b-field', {
    attrs: {
      "horizontal": "",
      "label": "Opacity"
    }
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model.number",
      value: (_vm.alpha),
      expression: "alpha",
      modifiers: {
        "number": true
      }
    }],
    staticClass: "opacity",
    attrs: {
      "type": "range",
      "min": "0",
      "max": "1",
      "step": "0.0001"
    },
    domProps: {
      "value": (_vm.alpha)
    },
    on: {
      "__r": function($event) {
        _vm.alpha = _vm._n($event.target.value)
      },
      "blur": function($event) {
        _vm.$forceUpdate()
      }
    }
  })])
},staticRenderFns: []}

/***/ }),

/***/ 1753:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "group-control"
  }, [_c('b-field', {
    attrs: {
      "label": "Group"
    }
  }, [_c('b-select', {
    model: {
      value: (_vm.currentGroup),
      callback: function($$v) {
        _vm.currentGroup = $$v
      },
      expression: "currentGroup"
    }
  }, _vm._l((_vm.groupLength), function(index) {
    return _c('option', {
      domProps: {
        "value": index - 1
      }
    }, [_vm._v(_vm._s(index))])
  })), _vm._v(" "), _c('button', {
    staticClass: "button",
    on: {
      "click": _vm.addGroup
    }
  }, [_c('b-icon', {
    attrs: {
      "icon": "plus"
    }
  })], 1), _vm._v(" "), _c('button', {
    staticClass: "button",
    on: {
      "click": _vm.removeGroup
    }
  }, [_c('b-icon', {
    attrs: {
      "icon": "minus"
    }
  })], 1)], 1), _vm._v(" "), _vm._l((_vm.controls), function(control) {
    return _c(control.component, {
      key: ("" + (control.meta.$modv_variable) + _vm.currentGroup),
      tag: "component",
      staticClass: "pure-control-group",
      attrs: {
        "module": _vm.module,
        "meta": control.meta
      }
    })
  })], 2)
},staticRenderFns: []}

/***/ }),

/***/ 1754:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "modal-card"
  }, [_c('header', {
    staticClass: "modal-card-head"
  }, [_c('p', {
    staticClass: "modal-card-title"
  }, [_vm._v("LFO Editor: " + _vm._s((_vm.moduleName + "." + _vm.controlVariable)))])]), _vm._v(" "), _c('section', {
    staticClass: "modal-card-body"
  }, [_c('b', [_vm._v("Function Type")]), _vm._v(" "), _c('b-field', _vm._l((_vm.lfoTypes), function(waveform, idx) {
    return _c('b-radio-button', {
      attrs: {
        "native-value": waveform
      },
      model: {
        value: (_vm.expressionFunction),
        callback: function($$v) {
          _vm.expressionFunction = $$v
        },
        expression: "expressionFunction"
      }
    }, [_c('img', {
      staticClass: "icon",
      attrs: {
        "src": ("@/../static/graphics/icons/" + waveform + ".svg")
      }
    }), _vm._v(" "), _c('span', [_vm._v(" " + _vm._s(_vm._f("capitalize")(waveform)))])])
  })), _vm._v(" "), _c('b', [_vm._v("Frequency")]), _c('br'), _vm._v(" "), _c('b-checkbox', {
    model: {
      value: (_vm.useBpm),
      callback: function($$v) {
        _vm.useBpm = $$v
      },
      expression: "useBpm"
    }
  }, [_vm._v("Use BPM")]), _vm._v(" "), _c('b-field', [_c('b-input', {
    attrs: {
      "disabled": _vm.useBpm,
      "type": "number",
      "step": "0.001"
    },
    model: {
      value: (_vm.frequency),
      callback: function($$v) {
        _vm.frequency = $$v
      },
      expression: "frequency"
    }
  })], 1)], 1)])
},staticRenderFns: []}

/***/ }),

/***/ 1755:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "2d-point-control",
    attrs: {
      "data-moduleName": _vm.moduleName
    }
  }, [_c('b-field', {
    attrs: {
      "label": _vm.label,
      "addons": false
    }
  }, [_c('div', {
    staticStyle: {
      "display": "inline-block"
    }
  }, [_c('div', {
    staticStyle: {
      "display": "inline-block"
    }
  }, [_c('canvas', {
    ref: "pad",
    staticClass: "pad",
    attrs: {
      "width": "170",
      "height": "170"
    },
    on: {
      "click": _vm.click,
      "mousedown": _vm.mouseDown,
      "touchstart": _vm.touchStart
    }
  })]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "inline-block",
      "vertical-align": "bottom"
    }
  }, [_c('b-field', {
    attrs: {
      "label": "X:",
      "addons": false
    }
  }, [_c('b-input', {
    staticClass: "pure-form-message-inline",
    attrs: {
      "type": "number",
      "step": "0.01"
    },
    on: {
      "input": _vm.xInput
    },
    model: {
      value: (_vm.currentX),
      callback: function($$v) {
        _vm.currentX = _vm._n($$v)
      },
      expression: "currentX"
    }
  })], 1), _vm._v(" "), _c('b-field', {
    attrs: {
      "label": "Y:",
      "addons": false
    }
  }, [_c('b-input', {
    staticClass: "pure-form-message-inline",
    attrs: {
      "type": "number",
      "step": "0.01"
    },
    on: {
      "input": _vm.yInput
    },
    model: {
      value: (_vm.currentY),
      callback: function($$v) {
        _vm.currentY = _vm._n($$v)
      },
      expression: "currentY"
    }
  })], 1)], 1)])])], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1756:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.Layer),
      expression: "Layer"
    }],
    staticClass: "column control-panel is-12 layer-controls"
  }, [_c('article', {
    staticClass: "message"
  }, [_c('div', {
    staticClass: "message-header"
  }, [_c('p', [_vm._v(_vm._s(_vm.name))])]), _vm._v(" "), _c('div', {
    directives: [{
      name: "bar",
      rawName: "v-bar",
      value: ({
        useScrollbarPseudo: true
      }),
      expression: "{ useScrollbarPseudo: true }"
    }],
    staticClass: "message-body"
  }, [_c('div', {
    directives: [{
      name: "bar",
      rawName: "v-bar"
    }],
    staticClass: "overflow-group"
  }, [_c('div', [_c('div', {
    staticClass: "control-group clearing-group"
  }, [_c('b-field', {
    attrs: {
      "label": "Clearing"
    }
  }, [_c('b-checkbox', {
    model: {
      value: (_vm.clearingChecked),
      callback: function($$v) {
        _vm.clearingChecked = $$v
      },
      expression: "clearingChecked"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "control-group inherit-group no-border"
  }, [_c('b-field', {
    attrs: {
      "label": "Inherit"
    }
  }, [_c('b-checkbox', {
    model: {
      value: (_vm.inheritChecked),
      callback: function($$v) {
        _vm.inheritChecked = $$v
      },
      expression: "inheritChecked"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "control-group inherit-group"
  }, [_c('b-field', {
    attrs: {
      "label": "Inherit From"
    }
  }, [_c('b-dropdown', {
    staticClass: "dropdown",
    model: {
      value: (_vm.inheritanceIndex),
      callback: function($$v) {
        _vm.inheritanceIndex = $$v
      },
      expression: "inheritanceIndex"
    }
  }, [_c('button', {
    staticClass: "button is-primary is-small",
    attrs: {
      "slot": "trigger"
    },
    slot: "trigger"
  }, [_c('span', [_vm._v(_vm._s(_vm._f("capitalize")(_vm.inheritedLayerName)))]), _vm._v(" "), _c('b-icon', {
    attrs: {
      "icon": "angle-down"
    }
  })], 1), _vm._v(" "), _c('b-dropdown-item', {
    attrs: {
      "value": -1
    }
  }, [_vm._v("Last Layer")]), _vm._v(" "), _vm._l((_vm.layers), function(layer, idx) {
    return _c('b-dropdown-item', {
      key: idx,
      attrs: {
        "value": idx
      }
    }, [_vm._v(_vm._s(layer.name))])
  })], 2)], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "control-group pipeline-group"
  }, [_c('b-field', {
    attrs: {
      "label": "Pipeline"
    }
  }, [_c('b-checkbox', {
    model: {
      value: (_vm.pipelineChecked),
      callback: function($$v) {
        _vm.pipelineChecked = $$v
      },
      expression: "pipelineChecked"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "control-group output-group"
  }, [_c('b-field', {
    attrs: {
      "label": "Draw to output"
    }
  }, [_c('b-checkbox', {
    model: {
      value: (_vm.drawToOutputChecked),
      callback: function($$v) {
        _vm.drawToOutputChecked = $$v
      },
      expression: "drawToOutputChecked"
    }
  })], 1)], 1)])])])])])
},staticRenderFns: []}

/***/ }),

/***/ 1757:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "pure-u-6-24 gallery-item",
    attrs: {
      "data-module-name": _vm.name
    },
    on: {
      "mouseout": _vm.mouseout,
      "mouseover": _vm.mouseover,
      "dblclick": _vm.doubleclick,
      "dragstart": _vm.dragstart
    }
  }, [_c('canvas', {
    ref: "canvas",
    staticClass: "preview"
  }), _vm._v(" "), _c('div', {
    staticClass: "title-wrapper"
  }, [_c('span', {
    staticClass: "module-title"
  }, [_vm._v(_vm._s(_vm.name))]), _vm._v(" "), _c('span', {
    staticClass: "ibvf"
  })]), _vm._v(" "), _c('i', {
    staticClass: "fa fa-info-circle fa-lg",
    attrs: {
      "aria-hidden": "true"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "information"
  }, [_c('div', {
    staticClass: "module"
  }, [_vm._v("Module: " + _vm._s(_vm.name))]), _vm._v(" "), (_vm.credit) ? _c('div', {
    staticClass: "author"
  }, [_vm._v("Credit: " + _vm._s(_vm.credit))]) : _vm._e(), _vm._v(" "), (_vm.version) ? _c('div', {
    staticClass: "version"
  }, [_vm._v("Version: " + _vm._s(_vm.version))]) : _vm._e(), _vm._v(" "), (_vm.isIsf) ? _c('div', {
    staticClass: "isf-version"
  }, [_vm._v("ISF Version: " + _vm._s(_vm.isfVersion))]) : _vm._e(), _vm._v(" "), (_vm.description) ? _c('div', {
    staticClass: "desciption"
  }, [_vm._v(_vm._s(_vm.description))]) : _vm._e()])])
},staticRenderFns: []}

/***/ }),

/***/ 1758:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    class: {
      open: _vm.menuState
    },
    attrs: {
      "id": "menu"
    }
  }, [_c('global-controls')], 1)
},staticRenderFns: []}

/***/ }),

/***/ 1762:
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
  return new Worker(__webpack_require__.p + "78d227b1e763f1e7865d.worker.js");
};

/***/ }),

/***/ 1763:
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
  return new Worker(__webpack_require__.p + "861df99400b7b79938d6.worker.js");
};

/***/ }),

/***/ 1764:
/***/ (function(module, exports) {

module.exports = {"name":"modv","version":"2.0.0","description":"Audio visualisation environment","author":"Sam Wray <sam@wray.pro>","license":"MIT","private":true,"scripts":{"dev":"node build/dev-server.js","start":"node build/dev-server.js","build":"node build/build.js","unit":"cross-env BABEL_ENV=test karma start test/unit/karma.conf.js --single-run","e2e":"node test/e2e/runner.js","test":"npm run unit && npm run e2e","lint":"eslint --ext .js,.vue src test/unit/specs test/e2e/specs"},"dependencies":{"modv-media-manager":"2xAA/modV-MediaManager","nw-builder":"^3.5.4","vue":"^2.5.3","vue-smooth-dnd":"^0.2.5","vuex":"^2.3.1","vuex-localstorage":"^1.0.0"},"devDependencies":{"ajv":"^5.3.0","animejs":"^2.2.0","autoprefixer":"^6.7.2","axios":"^0.18.0","babel-cli":"^6.26.0","babel-core":"^6.26.3","babel-eslint":"^8.2.1","babel-helper-vue-jsx-merge-props":"^2.0.3","babel-loader":"^7.1.1","babel-plugin-syntax-jsx":"^6.18.0","babel-plugin-transform-runtime":"^6.22.0","babel-plugin-transform-vue-jsx":"^3.5.0","babel-preset-env":"^1.7.0","babel-preset-stage-2":"^6.22.0","buefy":"^0.6.7","canvas-autoscale":"^2.0.0","ccapture.js":"^1.0.7","chai":"^3.5.0","chalk":"^1.1.3","chromedriver":"^2.33.2","connect-history-api-fallback":"^1.5.0","copy-webpack-plugin":"^4.2.0","correcting-interval":"^2.0.0","cross-env":"^4.0.0","cross-spawn":"^5.0.1","css-loader":"^0.28.0","eslint":"^3.19.0","eslint-config-airbnb-base":"^11.1.3","eslint-friendly-formatter":"^2.0.7","eslint-import-resolver-webpack":"^0.8.1","eslint-loader":"^1.7.1","eslint-plugin-html":"^2.0.0","eslint-plugin-import":"^2.8.0","eventemitter2":"^4.1.0","eventsource-polyfill":"^0.9.6","express":"^4.14.1","extract-text-webpack-plugin":"^2.0.0","file-loader":"^0.11.1","friendly-errors-webpack-plugin":"^1.1.3","globby":"^6.1.0","glsl-template-loader":"^1.1.0","hsy-vue-dropdown":"0.0.5","html-webpack-plugin":"^2.28.0","http-proxy-middleware":"^0.18.0","inject-loader":"^3.0.0","interactive-shader-format-for-modv":"^2.6.1","interactjs":"^1.2.9","karma":"^2.0.4","karma-coverage":"^1.1.2","karma-mocha":"^1.3.0","karma-phantomjs-launcher":"^1.0.2","karma-phantomjs-shim":"^1.4.0","karma-sinon-chai":"^1.3.3","karma-sourcemap-loader":"^0.3.7","karma-spec-reporter":"0.0.30","karma-webpack":"^3.0.0","lfo-for-modv":"0.0.1","lodash":"^4.17.10","lodash-es":"^4.17.4","lodash.clonedeep":"^4.5.0","lodash.debounce":"^4.0.8","lolex":"^1.5.2","mathjs":"^3.20.2","meyda":"^4.1.3","mocha":"^5.2.0","nightwatch":"^1.0.6","node-sass":"^4.9.0","nwjs-menu-browser":"^1.0.0","opn":"^4.0.2","optimize-css-assets-webpack-plugin":"^1.3.0","ora":"^1.2.0","phantomjs-prebuilt":"^2.1.16","reconnecting-websocket":"^4.0.0-rc5","regl":"^1.3.7","rimraf":"^2.6.0","sass-loader":"^6.0.5","selenium-server":"^3.7.1","semver":"^5.3.0","shelljs":"^0.7.6","sinon":"^2.1.0","sinon-chai":"^2.8.0","stats.js":"^0.17.0","tap-tempo":"^0.1.1","text-loader":"0.0.1","url-loader":"^1.0.1","vue-color":"^2.4.6","vue-js-modal":"^1.3.4","vue-loader":"^12.1.0","vue-notification":"^1.3.4","vue-shortkey":"^2.1.8","vue-style-loader":"^3.0.1","vue-template-compiler":"^2.5.3","vue-throttle-event":"^1.4.0","vuebar":"0.0.17","vuedraggable":"SortableJS/Vue.Draggable","webgl-compile-shader":"^2.3.9","webpack":"^2.6.1","webpack-bundle-analyzer":"^2.9.1","webpack-dev-middleware":"^1.10.0","webpack-hot-middleware":"^2.20.0","webpack-merge":"^4.1.1","worker-loader":"^1.1.1"},"engines":{"node":">= 4.0.0","npm":">= 3.0.0"},"browserslist":["> 1%","last 2 versions","not ie <= 8"]}

/***/ }),

/***/ 21:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return modV; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return webgl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return isf; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_eventemitter2__ = __webpack_require__(603);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_eventemitter2___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_eventemitter2__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__extra_beatdetektor__ = __webpack_require__(1003);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__store___ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Layer__ = __webpack_require__(1014);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__MediaStream__ = __webpack_require__(1016);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__draw__ = __webpack_require__(1019);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__webgl__ = __webpack_require__(1027);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__palette_worker_palette_worker__ = __webpack_require__(1023);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__MediaManagerClient__ = __webpack_require__(1015);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__install_plugin__ = __webpack_require__(1021);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_3__Layer__["a"]; });
/* unused harmony reexport draw */











class ModV extends __WEBPACK_IMPORTED_MODULE_0_eventemitter2___default.a {
  /**
   * [constructor description]
   * @param  {ModVOptions} options
   */
  constructor() {
    super();

    this.assignmentMax = 1;

    this.layers = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['layers/allLayers'];
    this.registeredModules = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['modVModules/registeredModules'];
    this.activeModules = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['modVModules/outerActive'];
    this.getActiveModule = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['modVModules/getActiveModule'];
    this.windows = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['windows/allWindows'];
    this.windowReference = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['windows/windowReference'];
    this.audioFeatures = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['meyda/features'];
    this.mediaStreamDevices = {
      audio: __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['mediaStream/audioSources'],
      video: __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['mediaStream/videoSources'],
    };
    this.palettes = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['palettes/allPalettes'];

    this.useDetectedBpm = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['tempo/detect'];
    this.bpm = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['tempo/bpm'];

    this.beatDetektor = new __WEBPACK_IMPORTED_MODULE_1__extra_beatdetektor__["a" /* default */](85, 169);
    this.beatDetektorKick = new __WEBPACK_IMPORTED_MODULE_1__extra_beatdetektor__["a" /* default */].modules.vis.BassKick();
    this.kick = false;

    this.mediaStreamScan = __WEBPACK_IMPORTED_MODULE_4__MediaStream__["a" /* scan */].bind(this);
    this.setMediaStreamSource = __WEBPACK_IMPORTED_MODULE_4__MediaStream__["b" /* setSource */].bind(this);

    this.width = 200;
    this.height = 200;

    this.webgl = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__webgl__["a" /* default */])(this);

    const ISFcanvas = document.createElement('canvas');
    const ISFgl = ISFcanvas.getContext('webgl2', {
      premultipliedAlpha: false,
    });

    this.isf = {
      canvas: ISFcanvas,
      gl: ISFgl,
    };

    this.mainRaf = null;
    this.workers = {};

    window.addEventListener('unload', () => {
      this.windows.forEach((windowController) => {
        const windowRef = this.windowReference(windowController.window);
        windowRef.close();
      });
    });

    this.delta = 0;
  }

  start(Vue) {
    const mediaStreamScan = this.mediaStreamScan;
    const setMediaStreamSource = this.setMediaStreamSource;

    this.bufferCanvas = document.createElement('canvas');
    this.bufferContext = this.bufferCanvas.getContext('2d');

    this.outputCanvas = document.createElement('canvas');
    this.outputContext = this.outputCanvas.getContext('2d');

    this.previewCanvas = document.getElementById('preview-canvas');
    this.previewContext = this.previewCanvas.getContext('2d');

    this.videoStream = document.createElement('video');
    this.videoStream.autoplay = true;
    this.videoStream.muted = true;

    __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].dispatch('windows/createWindow', { Vue });

    mediaStreamScan().then((mediaStreamDevices) => {
      mediaStreamDevices.audio.forEach(source => __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].commit('mediaStream/addAudioSource', { source }));
      mediaStreamDevices.video.forEach(source => __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].commit('mediaStream/addVideoSource', { source }));

      let audioSourceId;
      let videoSourceId;

      if (__WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['user/currentAudioSource']) {
        audioSourceId = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['user/currentAudioSource'];
      } else if (mediaStreamDevices.audio.length > 0) {
        audioSourceId = mediaStreamDevices.audio[0].deviceId;
      }

      if (__WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['user/setCurrentVideoSource']) {
        videoSourceId = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['user/setCurrentVideoSource'];
      } else if (mediaStreamDevices.video.length > 0) {
        videoSourceId = mediaStreamDevices.video[0].deviceId;
      }

      return {
        audioSourceId,
        videoSourceId,
      };
    }).then(setMediaStreamSource).then(({ audioSourceId, videoSourceId }) => {
      __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].commit('user/setCurrentAudioSource', { sourceId: audioSourceId });
      __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].commit('user/setCurrentVideoSource', { sourceId: videoSourceId });

      this.mainRaf = requestAnimationFrame(this.loop.bind(this));
    });

    this.workers = this.createWorkers();
    this.MediaManagerClient = new __WEBPACK_IMPORTED_MODULE_8__MediaManagerClient__["a" /* default */]();

    __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].dispatch('size/resizePreviewCanvas');
  }

  loop(δ) {
    this.delta = δ;
    let features = [];

    if (this.audioFeatures.length > 0) {
      features = this.meyda.get(this.audioFeatures);
    }

    if (features) {
      this.activeFeatures = features;

      const assignments = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['meyda/controlAssignments'];
      assignments.forEach((assignment) => {
        const featureValue = features[assignment.feature];

        __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].dispatch('modVModules/updateProp', {
          name: assignment.moduleName,
          prop: assignment.controlVariable,
          data: featureValue,
        });
      });

      this.beatDetektor.process((δ / 1000.0), features.complexSpectrum.real);
      this.updateBPM(this.beatDetektor.win_bpm_int_lo);
    }

    __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['plugins/enabledPlugins']
      .filter(plugin => ('process' in plugin.plugin))
      .forEach(plugin => plugin.plugin.process({
        delta: δ,
      }));

    this.beatDetektorKick.process(this.beatDetektor);
    this.kick = this.beatDetektorKick.isKick();

    __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].dispatch('modVModules/syncQueues');

    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__draw__["a" /* default */])(δ).then(() => {
      this.mainRaf = requestAnimationFrame(this.loop.bind(this));
    }).then(() => {
      this.emit('tick', δ);
    });
  }

  use(plugin) { //eslint-disable-line
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__install_plugin__["a" /* default */])(plugin);
  }

  addContextMenuHook(hook) { //eslint-disable-line
    __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].commit('contextMenu/addHook', {
      hookName: hook.hook,
      hook,
    });
  }

  register(Module) { //eslint-disable-line
    __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].dispatch('modVModules/register', Module);
  }

  resize(width, height, dpr = 1) {
    this.width = width * dpr;
    this.height = height * dpr;

    this.bufferCanvas.width = this.width;
    this.bufferCanvas.height = this.height;
    this.outputCanvas.width = this.width;
    this.outputCanvas.height = this.height;

    this.isf.canvas.width = this.width;
    this.isf.canvas.height = this.height;

    this.webgl.resize(this.width, this.height);
  }

  updateBPM(newBpm) {
    this.bpm = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['tempo/bpm'];
    this.useDetectedBpm = __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].getters['tempo/detect'];

    if (!newBpm || !this.useDetectedBpm) return;

    const bpm = Math.round(newBpm);
    if (this.bpm !== bpm) {
      __WEBPACK_IMPORTED_MODULE_2__store___["a" /* default */].dispatch('tempo/setBpm', { bpm });
    }
  }

  /** @return {WorkersDataType} */
  createWorkers() {//eslint-disable-line
    const palette = new __WEBPACK_IMPORTED_MODULE_7__palette_worker_palette_worker__["a" /* default */]();

    return {
      palette,
    };
  }


  static get Layer() {
    return __WEBPACK_IMPORTED_MODULE_3__Layer__["a" /* default */];
  }
}

const modV = new ModV();

window.modV = modV;
const webgl = modV.webgl;
const isf = modV.isf;

/* unused harmony default export */ var _unused_webpack_default_export = (modV);



/***/ }),

/***/ 597:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = generateControlData;
function generateControlData(settings = {}) {
  const controls = [];
  const { module } = settings;
  const exclude = settings.exclude || [];

  if (module) {
    const props = settings.props || module.props;

    if (!props) return controls;

    Object.keys(props).forEach((key) => {
      const propData = props[key];
      propData.$modv_variable = key;
      propData.$modv_moduleName = module.meta.name;

      if (typeof settings.group !== 'undefined') {
        propData.$modv_group = settings.group;
      }

      if (settings.groupName) {
        propData.$modv_groupName = settings.groupName;
      }

      const type = propData.type;
      const control = propData.control;

      if (control) {
        controls.push({
          component: control.type,
          meta: propData,
        });
      }

      if (type === 'group' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'groupControl',
          meta: propData,
        });
      }

      if (
        (type === 'int' && exclude.indexOf(type) < 0) ||
        (type === 'float' && exclude.indexOf(type) < 0)
      ) {
        controls.push({
          component: 'rangeControl',
          meta: propData,
        });
      }

      if (type === 'bool' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'checkboxControl',
          meta: propData,
        });
      }

      if (type === 'string' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'textControl',
          meta: propData,
        });
      }

      if (type === 'vec2' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'twoDPointControl',
          meta: propData,
        });
      }

      if (type === 'enum' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'selectControl',
          meta: propData,
        });
      }

      if (type === 'texture' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'imageControl',
          meta: propData,
        });
      }
    });
  }

  return controls;
}


/***/ }),

/***/ 598:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ([
  'sine',
  'sawtooth',
  'square',
  'noise',
]);


/***/ }),

/***/ 599:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return render; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_interactive_shader_format_for_modv__ = __webpack_require__(1088);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_interactive_shader_format_for_modv___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_interactive_shader_format_for_modv__);



function render({ Module, canvas, context, pipeline }) {
  if (Module.inputs) {
    Module.inputs.forEach((input) => {
      if (input.TYPE === 'image') {
        if (input.NAME in Module.props) {
          Module.renderer.setValue(input.NAME, Module[input.NAME] || canvas);
        } else {
          Module.renderer.setValue(input.NAME, canvas);
        }
      } else {
        Module.renderer.setValue(input.NAME, Module[input.NAME]);
      }
    });
  }

  __WEBPACK_IMPORTED_MODULE_0__modv__["b" /* isf */].gl.clear(__WEBPACK_IMPORTED_MODULE_0__modv__["b" /* isf */].gl.COLOR_BUFFER_BIT);
  Module.renderer.draw(__WEBPACK_IMPORTED_MODULE_0__modv__["b" /* isf */].canvas);

  context.save();
  context.globalAlpha = Module.meta.alpha || 1;
  context.globalCompositeOperation = Module.meta.compositeOperation || 'normal';
  if (pipeline) context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(__WEBPACK_IMPORTED_MODULE_0__modv__["b" /* isf */].canvas, 0, 0, canvas.width, canvas.height);
  context.restore();
}

function setup(Module) {
  let fragmentShader = Module.fragmentShader;
  let vertexShader = Module.vertexShader;

  const parser = new __WEBPACK_IMPORTED_MODULE_1_interactive_shader_format_for_modv__["Parser"]();
  parser.parse(fragmentShader, vertexShader);
  if (parser.error) {
    throw new Error(parser.error, `Error evaluating ${Module.meta.name}'s shaders`);
  }

  if (parser.isfVersion < 2) {
    fragmentShader = __WEBPACK_IMPORTED_MODULE_1_interactive_shader_format_for_modv__["Upgrader"].convertFragment(fragmentShader);
    if (vertexShader) vertexShader = __WEBPACK_IMPORTED_MODULE_1_interactive_shader_format_for_modv__["Upgrader"].convertVertex(vertexShader);
  }

  Module.meta.isfVersion = parser.isfVersion;
  Module.meta.author = parser.metadata.CREDIT;
  Module.meta.description = parser.metadata.DESCRIPTION;
  Module.meta.version = parser.metadata.VSN;

  Module.renderer = new __WEBPACK_IMPORTED_MODULE_1_interactive_shader_format_for_modv__["Renderer"](__WEBPACK_IMPORTED_MODULE_0__modv__["b" /* isf */].gl);
  Module.renderer.loadSource(fragmentShader, vertexShader);

  function addProp(name, prop) {
    if (!Module.props) {
      Module.props = {};
    }

    Module.props[name] = prop;
  }

  Module.inputs = parser.inputs;

  parser.inputs.forEach((input) => {
    switch (input.TYPE) {
      default:
        break;

      case 'float':
        addProp(input.NAME, {
          type: 'float',
          label: input.LABEL || input.NAME,
          default: (typeof input.DEFAULT !== 'undefined') ? input.DEFAULT : 0.0,
          min: input.MIN,
          max: input.MAX,
          step: 0.01,
        });
        break;

      case 'bool':
        addProp(input.NAME, {
          type: 'bool',
          label: input.LABEL || input.NAME,
          default: Boolean(input.DEFAULT),
        });
        break;

      case 'long':
        addProp(input.NAME, {
          type: 'enum',
          label: input.NAME,
          enum: input.VALUES
            .map((value, idx) => ({
              label: input.LABELS[idx],
              value,
              selected: (value === input.DEFAULT),
            }),
            ),
        });
        break;

      case 'color':
        addProp(input.NAME, {
          control: {
            type: 'colorControl',
            options: {
              returnFormat: 'mappedRgbaArray',
            },
          },
          label: input.LABEL || input.NAME,
          default: input.DEFAULT,
        });
        break;

      case 'point2D':
        addProp(input.NAME, {
          type: 'vec2',
          label: input.LABEL || input.NAME,
          default: input.DEFAULT || [0.0, 0.0],
          min: input.MIN,
          max: input.MAX,
        });
        break;

      case 'image':
        Module.meta.previewWithOutput = true;

        addProp(input.NAME, {
          type: 'texture',
          label: input.LABEL || input.NAME,
        });

        break;
    }
  });

  Module.draw = render;

  return Module;
}




/***/ }),

/***/ 600:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return render; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modv__ = __webpack_require__(21);


let modVCanvasTexture;

function render({ Module, canvas, context, pipeline }) {
  const regl = __WEBPACK_IMPORTED_MODULE_0__modv__["c" /* webgl */].regl;

  if (!modVCanvasTexture) {
    modVCanvasTexture = regl.texture({
      data: canvas,
      mipmap: true,
      wrap: ['mirror', 'mirror'],
      mag: 'linear',
      min: 'linear mipmap linear',
      flipY: Module.meta.flipY,
    });
  } else {
    modVCanvasTexture({
      data: canvas,
      mipmap: true,
      wrap: ['mirror', 'mirror'],
      mag: 'linear',
      min: 'linear mipmap linear',
      flipY: Module.meta.flipY,
    });
  }

  const uniforms = {
    u_modVCanvas: modVCanvasTexture,
    iChannel0: modVCanvasTexture,
    iChannel1: modVCanvasTexture,
    iChannel2: modVCanvasTexture,
    iChannel3: modVCanvasTexture,
    iMouse: [0, 0, 0, 0],
  };

  if (Module.props) {
    Object.keys(Module.props).forEach((key) => {
      uniforms[key] = Module[key];
    });
  }

  // if ('meyda' in Module.meta) {
  //   if (Module.meta.meyda.length > 0) {
  //     const meydaFeatures = modV.meyda.get(modV.audioFeatures);
  //     Module.meta.meyda.forEach((feature) => {
  //       const uniLoc = gl.getUniformLocation(webgl.programs[webgl.activeProgram], feature);

  //       const value = parseFloat(meydaFeatures[feature]);
  //       gl.uniform1f(uniLoc, value);
  //     });
  //   }
  // }

  regl.clear({
    depth: 1,
    color: [0, 0, 0, 0],
  });

  Module.reglDraw(uniforms);

  context.save();
  context.globalAlpha = Module.meta.alpha || 1;
  context.globalCompositeOperation = Module.meta.compositeOperation || 'normal';
  if (pipeline) context.clearRect(0, 0, canvas.width, canvas.height);
  // Copy Shader Canvas to Main Canvas
  context.drawImage(__WEBPACK_IMPORTED_MODULE_0__modv__["c" /* webgl */].canvas, 0, 0, canvas.width, canvas.height);

  context.restore();
}

/**
 * Makes a regl program from the given shader files
 *
 * @param  {Object}  A Shader Module definition
 * @return {Promise} Resolves with completion of compiled shaders
 */
function makeProgram(Module) {
  const regl = __WEBPACK_IMPORTED_MODULE_0__modv__["c" /* webgl */].regl;

  return new Promise((resolve, reject) => {
    // Read shader documents
    let vert = Module.vertexShader;
    let frag = Module.fragmentShader;

    if (!vert) vert = __WEBPACK_IMPORTED_MODULE_0__modv__["c" /* webgl */].defaultShader.v;
    if (!frag) frag = __WEBPACK_IMPORTED_MODULE_0__modv__["c" /* webgl */].defaultShader.f;

    if (frag.search('gl_FragColor') < 0) {
      frag = __WEBPACK_IMPORTED_MODULE_0__modv__["c" /* webgl */].defaultShader.fWrap.replace(
        /(%MAIN_IMAGE_INJECT%)/,
        frag,
      );

      vert = __WEBPACK_IMPORTED_MODULE_0__modv__["c" /* webgl */].defaultShader.v300;
    }

    const uniforms = {
      u_modVCanvas: regl.prop('u_modVCanvas'),
      iFrame: ({ tick }) => tick,
      iTime: ({ time }) => time,
      u_delta: ({ time }) => time,
      u_time: ({ time }) => time * 1000,
      iGlobalTime: ({ time }) => time,
      iResolution: ({ viewportWidth, viewportHeight, pixelRatio }) => [
        viewportWidth,
        viewportHeight,
        pixelRatio,
      ],
      iMouse: regl.prop('iMouse'),
      iChannel0: regl.prop('iChannel0'),
      iChannel1: regl.prop('iChannel1'),
      iChannel2: regl.prop('iChannel2'),
      iChannel3: regl.prop('iChannel3'),
      'iChannelResolution[0]': regl.prop('iChannelResolution[0]'),
      'iChannelResolution[1]': regl.prop('iChannelResolution[1]'),
      'iChannelResolution[2]': regl.prop('iChannelResolution[2]'),
      'iChannelResolution[3]': regl.prop('iChannelResolution[3]'),
    };

    if (Module.props) {
      Object.keys(Module.props).forEach((key) => {
        uniforms[key] = regl.prop(key);
      });
    }

    try {
      const draw = regl({
        vert,
        frag,

        attributes: {
          position: [
            -2, 2,
            0, -2,
            2, 2,
          ],
          a_position: [
            -2, 2,
            0, -2,
            2, 2,
          ],
        },

        uniforms,

        count: 3,
      });

      Module.reglDraw = draw;
      Module.draw = render;
    } catch (e) {
      reject(e);
    }

    resolve(Module);
  }).catch((reason) => {
    throw new Error(reason);
  });
}

async function setup(Module) {
  try {
    return await makeProgram(Module);
  } catch (e) {
    throw new Error(e);
  }
}




/***/ }),

/***/ 601:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Collator used for a natural sort
 */

/* harmony default export */ __webpack_exports__["a"] = (new Intl.Collator('en', {
  numeric: false, // eh?
  sensitivity: 'base',
}));


/***/ }),

/***/ 602:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = findBestName;
function nameTemplate(name, count) {
  if (count < 1) return name;

  return `${name} (${count})`;
}

function findBestName(nameIn, names) {
  return new Promise((resolve) => {
    if (names.indexOf(nameIn) < 0) {
      resolve(nameIn);
    }

    const nameRe = new RegExp(`\\b^${nameIn}\\s\\((\\d+?)\\)$`, 'g');

    let count = 1;
    let newName = nameTemplate(nameIn, count);

    const filteredNames = names.filter(arrName => arrName.match(nameRe));

    while (filteredNames.indexOf(newName) > -1) {
      count += 1;
      newName = nameTemplate(nameIn, count);
    }

    resolve(newName);
  });
}


/***/ }),

/***/ 745:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1054)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(915),
  /* template */
  __webpack_require__(1724),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-2b2e3cf3",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 746:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1065)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(916),
  /* template */
  __webpack_require__(1735),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-54ae331e",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 747:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1059)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(918),
  /* template */
  __webpack_require__(1730),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-428ffd0e",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 748:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1078)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(921),
  /* template */
  __webpack_require__(1750),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-b2b41748",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 749:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1046)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(923),
  /* template */
  __webpack_require__(1716),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-0ed31057",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 750:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1049)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(924),
  /* template */
  __webpack_require__(1719),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 751:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(925),
  /* template */
  __webpack_require__(1743),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 752:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1082)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(926),
  /* template */
  __webpack_require__(1755),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-e1b8b388",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 753:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1084)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(936),
  /* template */
  __webpack_require__(1757),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-ec2ea192",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 754:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1070)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(937),
  /* template */
  __webpack_require__(1741),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-6f80f41a",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 756:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_nwjs_menu_browser__ = __webpack_require__(98);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__store__ = __webpack_require__(1005);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__MenuHandler__ = __webpack_require__(1702);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__MenuHandler___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__MenuHandler__);


// import '@/../node_modules/nwjs-menu-browser/nwjs-menu-browser.css';



function searchForSubMenus(menu) {
  let menus = [];
  const submenus = [];

  menu.items.filter(item => !!item.submenu).forEach((item, idx) => {
    item.submenu.$id = `${menu.$id}-${idx}`;
    item.submenu.isSubmenu = true;
    menus.push(item.submenu);
    submenus.push(item.submenu);
    menus = menus.concat(searchForSubMenus(item.submenu));
  });
  menu.submenus = submenus;

  return menus;
}

function buildMenu(e, id, options, vnode, store) {
  e.preventDefault();
  const menu = new __WEBPACK_IMPORTED_MODULE_1_nwjs_menu_browser__["a" /* Menu */]();
  menu.$id = id;
  menu.isSubmenu = false;

  if ('createMenus' in options) {
    if (typeof options.createMenus === 'function') {
      options.createMenus();
    }
  }

  options.menuItems.forEach((item, idx) => menu.insert(item, idx));

  const moduleName = vnode.context.moduleName;
  const controlVariable = vnode.context.variable;
  const group = vnode.context.group;
  const groupName = vnode.context.groupName;

  const hooks = store.getters['contextMenu/hooks'];
  let hookItems = [];

  options.match.forEach((hook) => {
    if (hook in hooks) hookItems = hookItems.concat(hooks[hook]);
  });

  hookItems.forEach((item) => {
    if (options.internalVariable) {
      menu.append(item.buildMenuItem(
        moduleName,
        options.internalVariable,
        true,
      ));
    } else {
      menu.append(item.buildMenuItem(
        moduleName,
        controlVariable,
        group,
        groupName,
      ));
    }
  });

  let menus = [];
  menus.push(menu);
  menus = menus.concat(searchForSubMenus(menu));

  menus.forEach(menu => store.commit('contextMenu/addMenu', { Menu: menu, id: menu.$id }));

  store.dispatch('contextMenu/popup', { id, x: e.x, y: e.y });
  return false;
}

const ContextMenu = {
  name: 'Context Menu',
  store: __WEBPACK_IMPORTED_MODULE_2__store__["a" /* default */],

  install(Vue) {
    Vue.component('contextMenuHandler', __WEBPACK_IMPORTED_MODULE_3__MenuHandler___default.a);

    Vue.directive('context-menu', {
      bind(el, binding, vnode) {
        el.addEventListener('contextmenu', (e) => {
          buildMenu(e, vnode.context._uid, binding.value, vnode, __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */]); //eslint-disable-line
        });
      },
    });
  },
  component: __WEBPACK_IMPORTED_MODULE_3__MenuHandler___default.a,
};

/* harmony default export */ __webpack_exports__["a"] = (ContextMenu);


/***/ }),

/***/ 757:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__ = __webpack_require__(98);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__main__ = __webpack_require__(149);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__store__ = __webpack_require__(1006);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ExpressionInput__ = __webpack_require__(1704);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ExpressionInput___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__ExpressionInput__);








const Expression = {
  name: 'Value Expression',
  store: __WEBPACK_IMPORTED_MODULE_4__store__["a" /* default */],
  storeName: 'expression',

  install() {
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('expression/removeExpressions', { moduleName: mutation.payload.moduleName });
      }
    });

    __WEBPACK_IMPORTED_MODULE_1_modv__["a" /* modV */].addContextMenuHook({ hook: 'rangeControl', buildMenuItem: this.createMenuItem.bind(this) });
  },

  createMenuItem(moduleName, controlVariable) {
    async function click() {
      await __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('expression/setActiveControlData', {
        moduleName,
        controlVariable,
      });

      __WEBPACK_IMPORTED_MODULE_3__main__["default"].$modal.open({
        parent: __WEBPACK_IMPORTED_MODULE_3__main__["default"],
        component: __WEBPACK_IMPORTED_MODULE_5__ExpressionInput___default.a,
        hasModalCard: true,
      });
    }

    const menuItem = new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({
      label: 'Edit expression',
      click: click.bind(this),
    });

    return menuItem;
  },

  processValue({ delta, currentValue, moduleName, controlVariable }) {
    let value = currentValue;

    const assignment = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['expression/assignment'](moduleName, controlVariable);

    if (assignment) {
      const additionalScope = assignment.additionalScope;

      const scope = {
        value: currentValue,
        delta,
        map: Math.map,
      };

      Object.keys(additionalScope).forEach((key) => {
        scope[key] = additionalScope[key];
      });

      value = assignment.func.eval(scope);
    }

    return value;
  },
};

/* harmony default export */ __webpack_exports__["a"] = (Expression);


/***/ }),

/***/ 758:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__ = __webpack_require__(98);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_meyda__ = __webpack_require__(740);





const featureAssignment = {
  name: 'Feature Assignment',

  install() {
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('meyda/removeAssignments', { moduleName: mutation.payload.moduleName });
      }
    });

    __WEBPACK_IMPORTED_MODULE_1_modv__["a" /* modV */].addContextMenuHook({ hook: 'rangeControl', buildMenuItem: this.createMenuItem.bind(this) });
  },

  buildMeydaMenu(moduleName, controlVariable) {
    const MeydaFeaturesSubmenu = new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["a" /* Menu */]();
    let activeFeature = '';

    function clickFeature() {
      activeFeature = this.label;

      MeydaFeaturesSubmenu.items.forEach((item) => {
        item.checked = false;
        if (item.label === activeFeature) item.checked = true;
      });
      MeydaFeaturesSubmenu.rebuild();

      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('meyda/assignFeatureToControl', {
        feature: this.label,
        moduleName,
        controlVariable,
      });
    }

    function clickRemoveAssignment() {
      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('meyda/removeAssignments', { moduleName });
    }

    const assignments = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['meyda/assignment'](moduleName, controlVariable);
    const assignedFeatures = [];

    if (assignments) {
      assignments
        .map(assignment => assignment.feature)
        .forEach(feature => assignedFeatures.push(feature));

      MeydaFeaturesSubmenu.append(new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({
        label: 'Remove Feature Assignment',
        type: 'normal',
        click: clickRemoveAssignment,
      }));

      MeydaFeaturesSubmenu.append(new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({
        type: 'separator',
      }));
    }

    Object.keys(__WEBPACK_IMPORTED_MODULE_3_meyda__["a" /* default */].featureExtractors).forEach((feature) => {
      let shouldBeChecked = false;

      if (assignments) {
        shouldBeChecked = assignedFeatures.indexOf(feature) > -1;
      }

      MeydaFeaturesSubmenu.append(new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({
        label: feature,
        type: 'checkbox',
        checked: shouldBeChecked,
        click: clickFeature,
      }));
    });

    return MeydaFeaturesSubmenu;
  },

  createMenuItem(moduleName, controlVariable) {
    const MeydaFeaturesMenu = this.buildMeydaMenu(moduleName, controlVariable);
    const MeydaItem = new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({ label: 'Attach Feature', submenu: MeydaFeaturesMenu });

    return MeydaItem;
  },
};

/* harmony default export */ __webpack_exports__["a"] = (featureAssignment);


/***/ }),

/***/ 759:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ControlPanel__ = __webpack_require__(1706);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ControlPanel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__ControlPanel__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__store__ = __webpack_require__(1007);






const Worker = __webpack_require__(1762); //eslint-disable-line

/**
 * A module to grab data from the modVs output canvas to put it on
 * it's own "smallCanvas" (which is very small in terms of size to improve peformance)
 * and then send the pixel-data to luminave (https://github.com/NERDDISCO/luminave)
 * luminave is using the data to control other kind of lights (for example DMX512)
 *
 * @param{number} width - Width of the smallCanvas
 * @param{number} height - Height of the smallCanvas
 * @param{number} selectionX - Amount of areas we select on the x-axis
 * @param{number} selectionY - Amount of areas we select on the y-axis
 */
const theWorker = new Worker();

// Small version of the output canvas
const smallCanvas = document.createElement('canvas');
const smallContext = smallCanvas.getContext('2d');

// Add the canvas to modV for testing purposes :D
smallCanvas.classList.add('is-hidden');
smallCanvas.style = 'position: absolute; top: 0px; right: 0px; width: 80px; height: 80px; z-index: 100000; background: #000;';
document.body.appendChild(smallCanvas);

// Is the plugin active?
let isActive = true;

const grabCanvas = {
  name: 'Grab Canvas',
  controlPanelComponent: __WEBPACK_IMPORTED_MODULE_2__ControlPanel___default.a,
  store: __WEBPACK_IMPORTED_MODULE_3__store__["a" /* default */],

  presetData: {
    save() {
      return __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.grabCanvas;
    },

    load(data) {
      const { selectionX, selectionY, url } = data;

      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('grabCanvas/setSelection', { selectionX, selectionY });
      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('grabCanvas/setUrl', { url });
    },
  },

  on() {
    isActive = true;

    // Close the WebSocket connection
    theWorker.postMessage({
      type: 'startConnection',
    });
  },

  off() {
    isActive = false;

    // Close the WebSocket connection
    theWorker.postMessage({
      type: 'closeConnection',
    });
  },

  /**
   * When the canvas is resized: Update the worker.
   *
   * @param{Object} canvas - The modV output canvas
   */
  resize(canvas) {
    if (!canvas) return;

    theWorker.postMessage({
      type: 'setupCanvas',
      payload: {
        width: smallCanvas.width,
        height: smallCanvas.height,
        selectionX: __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.grabCanvas.selectionX,
        selectionY: __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.grabCanvas.selectionY,
      },
    });
  },

  /**
   * Only called when added to modV.
   */
  install() {
    isActive = true;

    // Set the size of the smallCanvas
    smallCanvas.width = 112;
    smallCanvas.height = 112;

    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].subscribe((mutation) => {
      switch (mutation.type) {
        case 'windows/setSize':
          this.resize({
            width: mutation.payload.width,
            height: mutation.payload.height,
          });
          break;

        case 'grabCanvas/setSelection':
          theWorker.postMessage({
            type: 'setupCanvas',
            payload: {
              width: smallCanvas.width,
              height: smallCanvas.height,
              selectionX: mutation.payload.selectionX || __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.grabCanvas.selectionX,
              selectionY: mutation.payload.selectionY || __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.grabCanvas.selectionY,
            },
          });
          break;

        case 'grabCanvas/setUrl':
          theWorker.postMessage({
            type: 'setupConnection',
            payload: {
              url: mutation.payload.url || __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.grabCanvas.url,
              active: isActive,
            },
          });
          break;

        case 'grabCanvas/setShowCanvas':
          smallCanvas.classList.toggle('is-hidden');
          break;

        default:
          break;
      }
    });

    this.resize(__WEBPACK_IMPORTED_MODULE_1_modv__["a" /* modV */].outputCanvas);

    // Create the WebSocket connection
    theWorker.postMessage({
      type: 'setupConnection',
      payload: {
        url: __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.grabCanvas.url,
        active: isActive,
      },
    });
  },

  /**
   * Called once every frame.
   * Allows access of each frame drawn to the screen.
   *
   * @param{Object} canvas - The modV output canvas
   */
  processFrame({ canvas }) {
    // Clear the output
    smallContext.clearRect(0, 0, smallCanvas.width, smallCanvas.height);

    // Create a small version of the canvas
    smallContext.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);

    // Get the pixels from the small canvas
    const data =
      smallContext.getImageData(0, 0, smallCanvas.width, smallCanvas.height).data.buffer;

    // Send the data to the worker
    theWorker.postMessage({
      type: 'data',
      payload: data,
    }, [
      data,
    ]);
  },
};

/* harmony default export */ __webpack_exports__["a"] = (grabCanvas);


/***/ }),

/***/ 760:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__ = __webpack_require__(98);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_lodash_es__ = __webpack_require__(1224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__main__ = __webpack_require__(149);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__store__ = __webpack_require__(1008);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__lfo_types__ = __webpack_require__(598);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__LFOEditor__ = __webpack_require__(1707);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__LFOEditor___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__LFOEditor__);










// info here: http://testtone.com/calculators/lfo-speed-calculator
function hzFromBpm(bpm = 120) {
  const secondsPerBeat = 60 / bpm;
  const secondsPerNote = secondsPerBeat * (4 / 2);
  const hertz = 1 / secondsPerNote;

  return hertz;
}

const lfoplugin = {
  name: 'LFO',
  waveforms: __WEBPACK_IMPORTED_MODULE_6__lfo_types__["a" /* default */],
  store: __WEBPACK_IMPORTED_MODULE_5__store__["a" /* default */],
  storeName: 'lfo',

  install() {
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('lfo/removeAssignments', { moduleName: mutation.payload.moduleName });
      }

      if (mutation.type === 'tempo/setBpm') {
        __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('lfo/updateBpmFrequency', { frequency: hzFromBpm(mutation.payload.bpm) });
      }
    });

    __WEBPACK_IMPORTED_MODULE_1_modv__["a" /* modV */].addContextMenuHook({
      hook: 'rangeControl',
      buildMenuItem: this.createMenuItem.bind(this),
    });
  },

  createMenuItem(moduleName, controlVariable, group, groupName) {
    const LfoSubmenu = new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["a" /* Menu */]();
    let label = 'Attach LFO';

    function attatchClick() {
      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('lfo/addAssignment', {
        moduleName,
        controlVariable,
        group,
        groupName,
        waveform: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3_lodash_es__["a" /* toLower */])(this.label),
        frequency: hzFromBpm(__WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['tempo/bpm']),
      });
    }

    function removeClick() {
      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('lfo/removeAssignment', {
        moduleName,
        controlVariable,
        group,
        groupName,
      });
    }

    async function editClick() {
      await __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('lfo/setActiveControlData', {
        moduleName,
        controlVariable,
      });

      __WEBPACK_IMPORTED_MODULE_4__main__["default"].$modal.open({
        parent: __WEBPACK_IMPORTED_MODULE_4__main__["default"],
        component: __WEBPACK_IMPORTED_MODULE_7__LFOEditor___default.a,
        hasModalCard: true,
      });
    }

    const assignment = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['lfo/assignment']({
      moduleName,
      controlVariable,
      group,
      groupName,
    });

    if (assignment) {
      label = 'LFO';

      LfoSubmenu.append(new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({
        label: 'Edit LFO',
        type: 'normal',
        click: editClick,
      }));

      LfoSubmenu.append(new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({
        label: 'Remove LFO',
        type: 'normal',
        click: removeClick,
      }));
    } else {
      this.waveforms.forEach((waveform) => {
        LfoSubmenu.append(new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({
          label: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3_lodash_es__["b" /* startCase */])(waveform),
          type: 'normal',
          click: attatchClick,
        }));
      });
    }

    const LfoMenuItem = new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({ label, submenu: LfoSubmenu });
    return LfoMenuItem;
  },

  process() { //eslint-disable-line
    const assignments = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['lfo/assignments'];

    Object.keys(assignments).forEach((moduleName) => {
      if (!__WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.modVModules.active[moduleName].meta.enabled) return;

      Object.keys(assignments[moduleName]).forEach((controlVariable) => {
        const assignment = assignments[moduleName][controlVariable];
        const module = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.modVModules.active[moduleName];

        if (assignment) {
          const { controller, group, groupName } = assignment;
          let control;
          let currentValue;

          if (typeof group !== 'undefined') {
            control = module.props[groupName].props[controlVariable];
            currentValue = module[groupName][controlVariable][group];
          } else {
            control = module.props[controlVariable];
            currentValue = module[controlVariable];
          }

          let value = currentValue;

          const { min, max } = control;
          value = Math.map(controller.value, -1, 1, min, max);

          if (currentValue === value) return;

          __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('modVModules/updateProp', {
            name: moduleName,
            prop: controlVariable,
            group,
            groupName,
            data: value,
          });
        }
      });
    });
  },

  makeValue({ currentValue, moduleName, controlVariable }) { //eslint-disable-line
    const assignment = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['lfo/assignment']({ moduleName, controlVariable });
    const control = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.modVModules.active[moduleName].props[controlVariable];

    let value = currentValue;

    if (assignment) {
      const lfoController = assignment.controller;
      const min = control.min;
      const max = control.max;
      value = Math.map(lfoController.value, -1, 1, min, max);
    }

    return value;
  },
};

/* harmony default export */ __webpack_exports__["a"] = (lfoplugin);


/***/ }),

/***/ 761:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__ = __webpack_require__(98);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__store__ = __webpack_require__(1010);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__assigner__ = __webpack_require__(1009);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ControlPanel__ = __webpack_require__(1708);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ControlPanel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__ControlPanel__);







let assigner;

const queue = new Map();

const midiAssignment = {
  name: 'MIDI Assignment',
  controlPanelComponent: __WEBPACK_IMPORTED_MODULE_5__ControlPanel___default.a,

  presetData: {
    save() {
      const { assignments, devices } = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.midiAssignment;

      return {
        assignments,
        devices,
      };
    },

    load(data) {
      const { assignments } = data;

      Object.keys(assignments).forEach((assignmentKey) => {
        __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('midiAssignment/setAssignment', {
          key: assignmentKey,
          value: assignments[assignmentKey],
        });

        // do something with devices (currently not used)
      });
    },
  },

  pluginData: {
    // save to be called on Plugin Store action
    save() {
      return {
        data: 'to save',
      };
    },

    load(data) {
      console.log('data loaded', data.data === 'to save');
    },
  },

  install(Vue) {
    Vue.component(__WEBPACK_IMPORTED_MODULE_5__ControlPanel___default.a.name, __WEBPACK_IMPORTED_MODULE_5__ControlPanel___default.a);
    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].registerModule('midiAssignment', __WEBPACK_IMPORTED_MODULE_3__store__["a" /* default */]);

    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('midiAssignment/removeAssignments', {
          moduleName: mutation.payload.moduleName,
        });
      }
    });

    assigner = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__assigner__["a" /* default */])({
      get: __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].getters['midiAssignment/assignment'],
      set(key, value) {
        __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('midiAssignment/setAssignment', { key, value });
      },
      callback: ({ assignment, message }) => {
        const midiEvent = message;
        const data = assignment.variable.split(',');

        const moduleName = data[0];
        const variableName = data[1];

        // the assignment is not for an internal control
        if (!data[2]) {
          const Module = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.modVModules.active[moduleName];
          const prop = Module.props[variableName];

          const newValue = Math.map(midiEvent.data[2], 0, 127, prop.min || 0, prop.max || 1);

          queue.set(moduleName, { internal: false, key: variableName, value: newValue });

          return;
        }
        // the assignment is an internal control
        const type = data[1];

        // The "enable" button for the module
        if (type === 'enable') {
          /*
           * Only listen for On-events (button pressed)
           *
           * data[0] defines the specific MIDI "action" that gets triggered based
           * on which type the MIDI element has (for example a button might have
           * the type "Note"). Based on this we can handle different actions
           *
           * 1. Controlchange
           * - 176 = This is a Controlchange event
           * - 63 = Only listen for "button pressed", because this is the velocity
           * - 0 = If the velocity is zero, it's a "button released"
           *
           * 2. NoteOn
           * - 144 = This is a NoteOn event
           */
          if ((midiEvent.data[0] === 176 && (midiEvent.data[2] > 63 || midiEvent.data[2] === 0))
              || midiEvent.data[0] === 144) {
            const module = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].state.modVModules.active[moduleName];
            const enabled = module.meta.enabled;

            queue.set(moduleName, { internal: true, key: 'enabled', value: !enabled });
          }
        } else if (type === 'alpha') {
          const value = Math.map(midiEvent.data[2], 0, 127, 0, 1);

          queue.set(moduleName, { internal: true, key: 'alpha', value });
        } else if(type === 'blending') { //eslint-disable-line

        }
      },
    });

    assigner.start();

    __WEBPACK_IMPORTED_MODULE_1_modv__["a" /* modV */].addContextMenuHook({
      hook: 'rangeControl',
      buildMenuItem: this.createMenuItem.bind(this),
    });

    __WEBPACK_IMPORTED_MODULE_1_modv__["a" /* modV */].addContextMenuHook({
      hook: '@modv/module:internal',
      buildMenuItem: this.createMenuItem.bind(this),
    });
  },

  createMenuItem(moduleName, controlVariable, internal) {
    let assignmentString = `${moduleName},${controlVariable}`;

    if (internal) {
      assignmentString += ',internal';
    }

    function click() {
      assigner.learn(assignmentString);
    }

    let MidiItem = new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({
      label: 'Learn MIDI assignment',
      click: click.bind(this),
    });


    const existingChannel = __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */]
      .getters['midiAssignment/midiChannelFromAssignment'](assignmentString);

    if (existingChannel) {
      MidiItem = new __WEBPACK_IMPORTED_MODULE_2_nwjs_menu_browser__["b" /* MenuItem */]({
        label: 'Remove MIDI assignment',
        click() {
          __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit('midiAssignment/removeAssignment', { key: existingChannel });
        },
      });
    }

    return MidiItem;
  },

  process() {
    queue.forEach((mapValue, mapKey) => {
      const name = mapKey;
      const { internal, key, value } = mapValue;

      if (internal) {
        __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('modVModules/updateMeta', {
          name,
          metaKey: key,
          data: value,
        });
      } else {
        __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].dispatch('modVModules/updateProp', {
          name,
          prop: key,
          data: value,
        });
      }
    });

    queue.clear();
  },
};

/* harmony default export */ __webpack_exports__["a"] = (midiAssignment);


/***/ }),

/***/ 762:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__store__ = __webpack_require__(1011);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__store___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__store__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Gallery__ = __webpack_require__(1709);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Gallery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Gallery__);




const shaderToy = {
  name: 'Shadertoy',
  galleryTabComponent: __WEBPACK_IMPORTED_MODULE_2__Gallery___default.a,

  /**
   * Only called when added as a Vue plugin,
   * this must be registered with vue before modV
   * to use vuex or vue
   */
  install(Vue) {
    Vue.component(__WEBPACK_IMPORTED_MODULE_2__Gallery___default.a.name, __WEBPACK_IMPORTED_MODULE_2__Gallery___default.a);

    __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].registerModule('shaderToy', __WEBPACK_IMPORTED_MODULE_1__store___default.a);
  },
};

/* harmony default export */ __webpack_exports__["a"] = (shaderToy);


/***/ }),

/***/ 763:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ControlPanel__ = __webpack_require__(1710);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ControlPanel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__ControlPanel__);


/**
 * Slim version of the UI
 */
const slimUi = {
  name: 'Slim UI',
  controlPanelComponent: __WEBPACK_IMPORTED_MODULE_0__ControlPanel___default.a,

  /**
   * Only called when added to modV.
   */
  install() {
    this.activate();
  },

  on() {
    this.activate();
  },

  off() {
    this.deactivate();
  },

  activate() {
    document.body.classList.add('slimui');
  },

  deactivate() {
    document.body.classList.remove('slimui');
  },
};

/* harmony default export */ __webpack_exports__["a"] = (slimUi);


/***/ }),

/***/ 764:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = attachResizeHandles;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store___ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__top__ = __webpack_require__(1013);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__left__ = __webpack_require__(1012);




function attachResizeHandles() {
  const attachResizeTop = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__top__["a" /* default */])();
  const attachResizeLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__left__["a" /* default */])();

  attachResizeTop(document.querySelector('.resize-handle-top'), () => {
    __WEBPACK_IMPORTED_MODULE_0__store___["a" /* default */].dispatch('size/resizePreviewCanvas');

    const vuebarContainers = document.querySelectorAll('.vb');

    // @todo - this will eventually break.
    vuebarContainers.forEach(
      element => window.modVVue.$vuebar.refreshScrollbar(element),
    );
  });
  attachResizeLeft(document.querySelector('.resize-handle-left'));
}


/***/ }),

/***/ 765:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const CapitalizeFilter = {};

/* harmony default export */ __webpack_exports__["a"] = (CapitalizeFilter.install = (Vue) => {
  Vue.mixin({
    filters: {
      capitalize(valueIn) {
        let value = valueIn;
        if (!value) return '';
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
  });
});


/***/ }),

/***/ 766:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 768:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(1074)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(911),
  /* template */
  __webpack_require__(1746),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 772:
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./Ball-2.0": [
		784,
		85
	],
	"./Ball-2.0.js": [
		784,
		85
	],
	"./ChromaticAbberation": [
		785,
		10
	],
	"./ChromaticAbberation.js": [
		785,
		10
	],
	"./ChromaticAbberation/chromaticAbberation.frag": [
		1765,
		91
	],
	"./Concentrics": [
		787,
		83
	],
	"./Concentrics-2.0": [
		786,
		84
	],
	"./Concentrics-2.0.js": [
		786,
		84
	],
	"./Concentrics.js": [
		787,
		83
	],
	"./Doughnut_Generator": [
		788,
		82
	],
	"./Doughnut_Generator.js": [
		788,
		82
	],
	"./EdgeDistort": [
		789,
		4
	],
	"./EdgeDistort.js": [
		789,
		4
	],
	"./Emboss": [
		790,
		3
	],
	"./Emboss.js": [
		790,
		3
	],
	"./FilmGrain": [
		791,
		9
	],
	"./FilmGrain.js": [
		791,
		9
	],
	"./FilmGrain/filmGrain.frag": [
		1766,
		90
	],
	"./Fisheye": [
		792,
		8
	],
	"./Fisheye.js": [
		792,
		8
	],
	"./Fisheye/fisheye.frag": [
		1767,
		89
	],
	"./MattiasCRT-2.0": [
		793,
		7
	],
	"./MattiasCRT-2.0.js": [
		793,
		7
	],
	"./MattiasCRT/mattiasCrt.frag": [
		1768,
		88
	],
	"./MirrorEdge": [
		794,
		2
	],
	"./MirrorEdge.js": [
		794,
		2
	],
	"./Neon": [
		795,
		1
	],
	"./Neon.js": [
		795,
		1
	],
	"./OpticalFlowDistort-2.0": [
		796,
		0
	],
	"./OpticalFlowDistort-2.0.js": [
		796,
		0
	],
	"./Phyllotaxis": [
		797,
		81
	],
	"./Phyllotaxis.js": [
		797,
		81
	],
	"./Pixelate-2.0": [
		798,
		80
	],
	"./Pixelate-2.0.js": [
		798,
		80
	],
	"./Plasma": [
		799,
		6
	],
	"./Plasma.js": [
		799,
		6
	],
	"./Plasma/plasma.frag": [
		1769,
		87
	],
	"./Polygon": [
		800,
		79
	],
	"./Polygon.js": [
		800,
		79
	],
	"./SolidColor": [
		801,
		78
	],
	"./SolidColor.js": [
		801,
		78
	],
	"./Text": [
		802,
		11
	],
	"./Text.js": [
		802,
		11
	],
	"./Un-Deux-Trois": [
		803,
		77
	],
	"./Un-Deux-Trois.js": [
		803,
		77
	],
	"./Waveform-2.0": [
		804,
		76
	],
	"./Waveform-2.0.js": [
		804,
		76
	],
	"./Webcam": [
		805,
		75
	],
	"./Webcam.js": [
		805,
		75
	],
	"./Wobble": [
		806,
		5
	],
	"./Wobble.js": [
		806,
		5
	],
	"./Wobble/wobble.frag": [
		1770,
		86
	],
	"./isf-samples/ASCII Art.fs": [
		807,
		74
	],
	"./isf-samples/BrightnessContrast.fs": [
		808,
		73
	],
	"./isf-samples/Circuits.fs": [
		809,
		72
	],
	"./isf-samples/Collage.fs": [
		810,
		71
	],
	"./isf-samples/CollapsingArchitecture.fs": [
		811,
		70
	],
	"./isf-samples/CompoundWaveStudy1.fs": [
		812,
		69
	],
	"./isf-samples/Convergence.fs": [
		813,
		68
	],
	"./isf-samples/Dither-Bayer.fs": [
		814,
		67
	],
	"./isf-samples/Echo Trace.fs": [
		815,
		66
	],
	"./isf-samples/Edge Distort.fs": [
		774,
		65
	],
	"./isf-samples/Edge Distort.vs": [
		775,
		64
	],
	"./isf-samples/Emboss.fs": [
		776,
		63
	],
	"./isf-samples/Emboss.vs": [
		777,
		62
	],
	"./isf-samples/FractilianParabolicCircleInversion.fs": [
		816,
		61
	],
	"./isf-samples/GreatBallOfFire.fs": [
		817,
		60
	],
	"./isf-samples/HexVortex.fs": [
		818,
		59
	],
	"./isf-samples/Hue-Saturation.fs": [
		819,
		58
	],
	"./isf-samples/Interlace.fs": [
		820,
		57
	],
	"./isf-samples/Kaleidoscope Tile.fs": [
		821,
		56
	],
	"./isf-samples/Kaleidoscope.fs": [
		822,
		55
	],
	"./isf-samples/LogTransWarpSpiral.fs": [
		823,
		54
	],
	"./isf-samples/MBOX3.fs": [
		824,
		53
	],
	"./isf-samples/Meta Image.fs": [
		825,
		52
	],
	"./isf-samples/Mirror Edge.fs": [
		778,
		51
	],
	"./isf-samples/Mirror Edge.vs": [
		779,
		50
	],
	"./isf-samples/Neon.fs": [
		780,
		49
	],
	"./isf-samples/Neon.vs": [
		781,
		48
	],
	"./isf-samples/Optical Flow Distort.fs": [
		782,
		47
	],
	"./isf-samples/Optical Flow Distort.vs": [
		783,
		46
	],
	"./isf-samples/Pinch.fs": [
		826,
		45
	],
	"./isf-samples/Pixel Shifter.fs/Pixel Shifter.fs.fs": [
		827,
		44
	],
	"./isf-samples/Pixel Shifter.fs/Pixel Shifter.fs.vs": [
		828,
		43
	],
	"./isf-samples/RGB Halftone-lookaround.fs": [
		829,
		42
	],
	"./isf-samples/RGB Strobe.fs": [
		830,
		41
	],
	"./isf-samples/RGB Trails 3.0.fs": [
		831,
		40
	],
	"./isf-samples/Random Shape.fs": [
		832,
		39
	],
	"./isf-samples/Sine Warp Tile.fs": [
		833,
		38
	],
	"./isf-samples/Slice.fs": [
		834,
		37
	],
	"./isf-samples/Triangles.fs": [
		835,
		36
	],
	"./isf-samples/UltimateFlame.fs": [
		836,
		35
	],
	"./isf-samples/UltimateSpiral.fs": [
		837,
		34
	],
	"./isf-samples/VHS Glitch.fs.fs": [
		838,
		33
	],
	"./isf-samples/Vignette.fs": [
		839,
		32
	],
	"./isf-samples/WaveLines.fs": [
		840,
		31
	],
	"./isf-samples/Zebre.fs": [
		841,
		30
	],
	"./isf-samples/badtv.fs": [
		842,
		29
	],
	"./isf-samples/block-color.fs": [
		843,
		28
	],
	"./isf-samples/bokeh.fs": [
		844,
		27
	],
	"./isf-samples/digital-crystal-tunnel.fs": [
		845,
		26
	],
	"./isf-samples/feedback.fs": [
		846,
		25
	],
	"./isf-samples/film-grain.fs": [
		847,
		24
	],
	"./isf-samples/hexagons.fs": [
		848,
		23
	],
	"./isf-samples/plasma.fs": [
		849,
		22
	],
	"./isf-samples/plasmaglobe.fs": [
		850,
		21
	],
	"./isf-samples/rgbglitchmod.fs": [
		851,
		20
	],
	"./isf-samples/rgbtimeglitch.fs": [
		852,
		19
	],
	"./isf-samples/rotozoomer.fs": [
		853,
		18
	],
	"./isf-samples/scale.fs": [
		854,
		17
	],
	"./isf-samples/spherical-shader-tut.fs": [
		855,
		16
	],
	"./isf-samples/st_Ms2SD1.fs.fs": [
		856,
		15
	],
	"./isf-samples/st_lsfGDH.fs": [
		857,
		14
	],
	"./isf-samples/tapestryfract.fs": [
		858,
		13
	],
	"./isf-samples/v002 Crosshatch.fs": [
		859,
		12
	]
};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids)
		return Promise.reject(new Error("Cannot find module '" + req + "'."));
	return __webpack_require__.e(ids[1]).then(function() {
		return __webpack_require__(ids[0]);
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
module.exports = webpackAsyncContext;
webpackAsyncContext.id = 772;

/***/ }),

/***/ 773:
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./ASCII Art.fs": [
		807,
		74
	],
	"./BrightnessContrast.fs": [
		808,
		73
	],
	"./Circuits.fs": [
		809,
		72
	],
	"./Collage.fs": [
		810,
		71
	],
	"./CollapsingArchitecture.fs": [
		811,
		70
	],
	"./CompoundWaveStudy1.fs": [
		812,
		69
	],
	"./Convergence.fs": [
		813,
		68
	],
	"./Dither-Bayer.fs": [
		814,
		67
	],
	"./Echo Trace.fs": [
		815,
		66
	],
	"./Edge Distort.fs": [
		774,
		65
	],
	"./Edge Distort.vs": [
		775,
		64
	],
	"./Emboss.fs": [
		776,
		63
	],
	"./Emboss.vs": [
		777,
		62
	],
	"./FractilianParabolicCircleInversion.fs": [
		816,
		61
	],
	"./GreatBallOfFire.fs": [
		817,
		60
	],
	"./HexVortex.fs": [
		818,
		59
	],
	"./Hue-Saturation.fs": [
		819,
		58
	],
	"./Interlace.fs": [
		820,
		57
	],
	"./Kaleidoscope Tile.fs": [
		821,
		56
	],
	"./Kaleidoscope.fs": [
		822,
		55
	],
	"./LogTransWarpSpiral.fs": [
		823,
		54
	],
	"./MBOX3.fs": [
		824,
		53
	],
	"./Meta Image.fs": [
		825,
		52
	],
	"./Mirror Edge.fs": [
		778,
		51
	],
	"./Mirror Edge.vs": [
		779,
		50
	],
	"./Neon.fs": [
		780,
		49
	],
	"./Neon.vs": [
		781,
		48
	],
	"./Optical Flow Distort.fs": [
		782,
		47
	],
	"./Optical Flow Distort.vs": [
		783,
		46
	],
	"./Pinch.fs": [
		826,
		45
	],
	"./Pixel Shifter.fs/Pixel Shifter.fs.fs": [
		827,
		44
	],
	"./Pixel Shifter.fs/Pixel Shifter.fs.vs": [
		828,
		43
	],
	"./RGB Halftone-lookaround.fs": [
		829,
		42
	],
	"./RGB Strobe.fs": [
		830,
		41
	],
	"./RGB Trails 3.0.fs": [
		831,
		40
	],
	"./Random Shape.fs": [
		832,
		39
	],
	"./Sine Warp Tile.fs": [
		833,
		38
	],
	"./Slice.fs": [
		834,
		37
	],
	"./Triangles.fs": [
		835,
		36
	],
	"./UltimateFlame.fs": [
		836,
		35
	],
	"./UltimateSpiral.fs": [
		837,
		34
	],
	"./VHS Glitch.fs.fs": [
		838,
		33
	],
	"./Vignette.fs": [
		839,
		32
	],
	"./WaveLines.fs": [
		840,
		31
	],
	"./Zebre.fs": [
		841,
		30
	],
	"./badtv.fs": [
		842,
		29
	],
	"./block-color.fs": [
		843,
		28
	],
	"./bokeh.fs": [
		844,
		27
	],
	"./digital-crystal-tunnel.fs": [
		845,
		26
	],
	"./feedback.fs": [
		846,
		25
	],
	"./film-grain.fs": [
		847,
		24
	],
	"./hexagons.fs": [
		848,
		23
	],
	"./plasma.fs": [
		849,
		22
	],
	"./plasmaglobe.fs": [
		850,
		21
	],
	"./rgbglitchmod.fs": [
		851,
		20
	],
	"./rgbtimeglitch.fs": [
		852,
		19
	],
	"./rotozoomer.fs": [
		853,
		18
	],
	"./scale.fs": [
		854,
		17
	],
	"./spherical-shader-tut.fs": [
		855,
		16
	],
	"./st_Ms2SD1.fs.fs": [
		856,
		15
	],
	"./st_lsfGDH.fs": [
		857,
		14
	],
	"./tapestryfract.fs": [
		858,
		13
	],
	"./v002 Crosshatch.fs": [
		859,
		12
	]
};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids)
		return Promise.reject(new Error("Cannot find module '" + req + "'."));
	return __webpack_require__.e(ids[1]).then(function() {
		return __webpack_require__(ids[0]);
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
module.exports = webpackAsyncContext;
webpackAsyncContext.id = 773;

/***/ }),

/***/ 889:
/***/ (function(module, exports) {

module.exports = {"$schema":"http://json-schema.org/draft-06/schema#","$id":"https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/$data.json#","description":"Meta-schema for $data reference (JSON-schema extension proposal)","type":"object","required":["$data"],"properties":{"$data":{"type":"string","anyOf":[{"format":"relative-json-pointer"},{"format":"json-pointer"}]}},"additionalProperties":false}

/***/ }),

/***/ 890:
/***/ (function(module, exports) {

module.exports = {"id":"http://json-schema.org/draft-04/schema#","$schema":"http://json-schema.org/draft-04/schema#","description":"Core schema meta-schema","definitions":{"schemaArray":{"type":"array","minItems":1,"items":{"$ref":"#"}},"positiveInteger":{"type":"integer","minimum":0},"positiveIntegerDefault0":{"allOf":[{"$ref":"#/definitions/positiveInteger"},{"default":0}]},"simpleTypes":{"enum":["array","boolean","integer","null","number","object","string"]},"stringArray":{"type":"array","items":{"type":"string"},"minItems":1,"uniqueItems":true}},"type":"object","properties":{"id":{"type":"string","format":"uri"},"$schema":{"type":"string","format":"uri"},"title":{"type":"string"},"description":{"type":"string"},"default":{},"multipleOf":{"type":"number","minimum":0,"exclusiveMinimum":true},"maximum":{"type":"number"},"exclusiveMaximum":{"type":"boolean","default":false},"minimum":{"type":"number"},"exclusiveMinimum":{"type":"boolean","default":false},"maxLength":{"$ref":"#/definitions/positiveInteger"},"minLength":{"$ref":"#/definitions/positiveIntegerDefault0"},"pattern":{"type":"string","format":"regex"},"additionalItems":{"anyOf":[{"type":"boolean"},{"$ref":"#"}],"default":{}},"items":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/schemaArray"}],"default":{}},"maxItems":{"$ref":"#/definitions/positiveInteger"},"minItems":{"$ref":"#/definitions/positiveIntegerDefault0"},"uniqueItems":{"type":"boolean","default":false},"maxProperties":{"$ref":"#/definitions/positiveInteger"},"minProperties":{"$ref":"#/definitions/positiveIntegerDefault0"},"required":{"$ref":"#/definitions/stringArray"},"additionalProperties":{"anyOf":[{"type":"boolean"},{"$ref":"#"}],"default":{}},"definitions":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"properties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"patternProperties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"dependencies":{"type":"object","additionalProperties":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/stringArray"}]}},"enum":{"type":"array","minItems":1,"uniqueItems":true},"type":{"anyOf":[{"$ref":"#/definitions/simpleTypes"},{"type":"array","items":{"$ref":"#/definitions/simpleTypes"},"minItems":1,"uniqueItems":true}]},"allOf":{"$ref":"#/definitions/schemaArray"},"anyOf":{"$ref":"#/definitions/schemaArray"},"oneOf":{"$ref":"#/definitions/schemaArray"},"not":{"$ref":"#"}},"dependencies":{"exclusiveMaximum":["maximum"],"exclusiveMinimum":["minimum"]},"default":{}}

/***/ }),

/***/ 891:
/***/ (function(module, exports) {

module.exports = {"$schema":"http://json-schema.org/draft-06/schema#","$id":"http://json-schema.org/draft-06/schema#","title":"Core schema meta-schema","definitions":{"schemaArray":{"type":"array","minItems":1,"items":{"$ref":"#"}},"nonNegativeInteger":{"type":"integer","minimum":0},"nonNegativeIntegerDefault0":{"allOf":[{"$ref":"#/definitions/nonNegativeInteger"},{"default":0}]},"simpleTypes":{"enum":["array","boolean","integer","null","number","object","string"]},"stringArray":{"type":"array","items":{"type":"string"},"uniqueItems":true,"default":[]}},"type":["object","boolean"],"properties":{"$id":{"type":"string","format":"uri-reference"},"$schema":{"type":"string","format":"uri"},"$ref":{"type":"string","format":"uri-reference"},"title":{"type":"string"},"description":{"type":"string"},"default":{},"multipleOf":{"type":"number","exclusiveMinimum":0},"maximum":{"type":"number"},"exclusiveMaximum":{"type":"number"},"minimum":{"type":"number"},"exclusiveMinimum":{"type":"number"},"maxLength":{"$ref":"#/definitions/nonNegativeInteger"},"minLength":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"pattern":{"type":"string","format":"regex"},"additionalItems":{"$ref":"#"},"items":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/schemaArray"}],"default":{}},"maxItems":{"$ref":"#/definitions/nonNegativeInteger"},"minItems":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"uniqueItems":{"type":"boolean","default":false},"contains":{"$ref":"#"},"maxProperties":{"$ref":"#/definitions/nonNegativeInteger"},"minProperties":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"required":{"$ref":"#/definitions/stringArray"},"additionalProperties":{"$ref":"#"},"definitions":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"properties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"patternProperties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"dependencies":{"type":"object","additionalProperties":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/stringArray"}]}},"propertyNames":{"$ref":"#"},"const":{},"enum":{"type":"array","minItems":1,"uniqueItems":true},"type":{"anyOf":[{"$ref":"#/definitions/simpleTypes"},{"type":"array","items":{"$ref":"#/definitions/simpleTypes"},"minItems":1,"uniqueItems":true}]},"format":{"type":"string"},"allOf":{"$ref":"#/definitions/schemaArray"},"anyOf":{"$ref":"#/definitions/schemaArray"},"oneOf":{"$ref":"#/definitions/schemaArray"},"not":{"$ref":"#"}},"default":{}}

/***/ }),

/***/ 911:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_CanvasPreview__ = __webpack_require__(1676);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_CanvasPreview___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_CanvasPreview__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_ControlPanelHandler__ = __webpack_require__(1682);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_ControlPanelHandler___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_ControlPanelHandler__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_Gallery__ = __webpack_require__(1689);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_Gallery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__components_Gallery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_GlobalControls__ = __webpack_require__(754);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_GlobalControls___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__components_GlobalControls__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_LayerControls__ = __webpack_require__(1691);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_LayerControls___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__components_LayerControls__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_LayerMenu__ = __webpack_require__(1694);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_LayerMenu___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__components_LayerMenu__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_List__ = __webpack_require__(1695);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_List___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__components_List__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__components_SideMenu__ = __webpack_require__(1697);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__components_SideMenu___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__components_SideMenu__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__components_StatusBar__ = __webpack_require__(1699);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__components_StatusBar___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__components_StatusBar__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__components_Tabs__ = __webpack_require__(1700);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__components_Tabs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__components_Tabs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//














/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'app',
  data: function data() {
    return {
      menuOpen: false
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_11_vuex__["b" /* mapGetters */])('plugins', ['enabledPlugins']), {
    pluginComponents: function pluginComponents() {
      return this.enabledPlugins.filter(function (plugin) {
        return 'component' in plugin.plugin;
      }).map(function (plugin) {
        return plugin.plugin.component.name;
      });
    }
  }),
  methods: {
    menuIconClicked: function menuIconClicked() {
      this.$data.menuOpen = !this.$data.menuOpen;
    }
  },
  components: {
    CanvasPreview: __WEBPACK_IMPORTED_MODULE_1__components_CanvasPreview___default.a,
    ControlPanelHandler: __WEBPACK_IMPORTED_MODULE_2__components_ControlPanelHandler___default.a,
    Gallery: __WEBPACK_IMPORTED_MODULE_3__components_Gallery___default.a,
    GlobalControls: __WEBPACK_IMPORTED_MODULE_4__components_GlobalControls___default.a,
    LayerControls: __WEBPACK_IMPORTED_MODULE_5__components_LayerControls___default.a,
    LayerMenu: __WEBPACK_IMPORTED_MODULE_6__components_LayerMenu___default.a,
    List: __WEBPACK_IMPORTED_MODULE_7__components_List___default.a,
    SideMenu: __WEBPACK_IMPORTED_MODULE_8__components_SideMenu___default.a,
    StatusBar: __WEBPACK_IMPORTED_MODULE_9__components_StatusBar___default.a,
    Tabs: __WEBPACK_IMPORTED_MODULE_10__components_Tabs___default.a
  }
});

/***/ }),

/***/ 912:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'opacityControl',
  props: ['moduleName'],
  computed: {
    alpha: {
      get: function get() {
        if (!this.moduleName) return 0;
        return this.$store.state.modVModules.active[this.moduleName].meta.alpha;
      },
      set: function set(value) {
        this.$store.dispatch('modVModules/updateMeta', {
          name: this.moduleName,
          metaKey: 'alpha',
          data: value
        });
      }
    }
  }
});

/***/ }),

/***/ 913:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__OpacityControl__ = __webpack_require__(1674);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__OpacityControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__OpacityControl__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'activeModule',
  components: {
    OpacityControl: __WEBPACK_IMPORTED_MODULE_2__OpacityControl___default.a
  },
  data: function data() {
    return {
      compositeOperation: 'normal',
      opacity: null,
      checkboxMenuOptions: {
        match: ['@modv/module:internal'],
        menuItems: [],
        internalVariable: 'enable'
      },
      opacityMenuOptions: {
        match: ['@modv/module:internal'],
        menuItems: [],
        internalVariable: 'alpha'
      },
      operations: [{
        label: 'Blend Modes',
        children: [{
          label: 'Normal',
          value: 'normal'
        }, {
          label: 'Multiply',
          value: 'multiply'
        }, {
          label: 'Overlay',
          value: 'overlay'
        }, {
          label: 'Darken',
          value: 'darken'
        }, {
          label: 'Lighten',
          value: 'lighten'
        }, {
          label: 'Color Dodge',
          value: 'color-dodge'
        }, {
          label: 'Color Burn',
          value: 'color-burn'
        }, {
          label: 'Hard Light',
          value: 'hard-light'
        }, {
          label: 'Soft Light',
          value: 'soft-light'
        }, {
          label: 'Difference',
          value: 'difference'
        }, {
          label: 'Exclusion',
          value: 'exclusion'
        }, {
          label: 'Hue',
          value: 'hue'
        }, {
          label: 'Saturation',
          value: 'saturation'
        }, {
          label: 'Color',
          value: 'color'
        }, {
          label: 'Luminosity',
          value: 'luminosity'
        }]
      }, {
        label: 'Composite Modes',
        children: [{
          label: 'Clear',
          value: 'clear'
        }, {
          label: 'Copy',
          value: 'copy'
        }, {
          label: 'Destination',
          value: 'destination'
        }, {
          label: 'Source Over',
          value: 'source-over'
        }, {
          label: 'Destination Over',
          value: 'destination-over'
        }, {
          label: 'Source In',
          value: 'source-in'
        }, {
          label: 'Destination In',
          value: 'destination-in'
        }, {
          label: 'Source Out',
          value: 'source-out'
        }, {
          label: 'Destination Out',
          value: 'destination-out'
        }, {
          label: 'Source Atop',
          value: 'source-atop'
        }, {
          label: 'Destination Atop',
          value: 'destination-atop'
        }, {
          label: 'Xor',
          value: 'xor'
        }, {
          label: 'Lighter',
          value: 'lighter'
        }]
      }]
    };
  },

  props: ['moduleName'],
  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('modVModules', ['activeModules', 'focusedModuleName']), {
    module: function module() {
      return this.$store.state.modVModules.active[this.moduleName];
    },
    enabledCheckboxId: function enabledCheckboxId() {
      return this.moduleName + ':modvreserved:enabled';
    },

    enabled: {
      get: function get() {
        if (!this.moduleName) return false;
        return this.$store.state.modVModules.active[this.moduleName].meta.enabled;
      },
      set: function set(value) {
        this.setActiveModuleEnabled({
          moduleName: this.moduleName,
          enabled: value
        });
      }
    },
    focused: function focused() {
      return this.moduleName === this.focusedModuleName;
    },
    blendModes: function blendModes() {
      return this.operations[0];
    },
    compositeOperations: function compositeOperations() {
      return this.operations[1];
    }
  }),
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["d" /* mapMutations */])('modVModules', ['setCurrentDragged', 'setModuleFocus', 'setActiveModuleEnabled', 'setActiveModuleCompositeOperation']), {
    focusActiveModule: function focusActiveModule() {
      this.setModuleFocus({ activeModuleName: this.moduleName });
    },
    dragstart: function dragstart() {
      this.setCurrentDragged({ moduleName: this.moduleName });
    },
    compositeOperationChanged: function compositeOperationChanged(item) {
      this.compositeOperation = item[0].value;
    },
    checkboxClick: function checkboxClick() {
      this.enabled = !this.enabled;
    },
    deletePress: function deletePress() {
      this.$store.dispatch('modVModules/removeActiveModule', { moduleName: this.moduleName });
    }
  }),
  mounted: function mounted() {
    var _this = this;

    if (!this.module) return;
    this.enabled = this.module.meta.enabled;
    this.opacity = this.module.meta.alpha;

    this.operations[0].children.find(function (item) {
      return item.value === _this.module.meta.compositeOperation;
    }).selected = true;
  },

  watch: {
    compositeOperation: function compositeOperation() {
      this.setActiveModuleCompositeOperation({
        moduleName: this.moduleName,
        compositeOperation: this.compositeOperation
      });
    }
  },
  filters: {
    capitalize: function capitalize(valueIn) {
      var value = valueIn;
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
});

/***/ }),

/***/ 914:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_OutputWindowButton__ = __webpack_require__(1696);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_OutputWindowButton___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_OutputWindowButton__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_interactjs__ = __webpack_require__(1089);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_interactjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_interactjs__);
//
//
//
//
//
//
//




function dragMoveListener(event) {
  var target = event.target;
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  var maxX = window.innerWidth - (10 + target.offsetWidth);
  var maxY = window.innerHeight - (10 + target.offsetHeight);
  var minX = 10;
  var minY = 10;

  if (x >= maxX) x = maxX;
  if (y >= maxY) y = maxY;
  if (x <= minX) x = minX;
  if (y <= minY) y = minY;

  // translate the element
  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'canvas-preview',
  components: {
    OutputWindowButton: __WEBPACK_IMPORTED_MODULE_0__components_OutputWindowButton___default.a
  },
  mounted: function mounted() {
    var preview = this.$refs.preview;
    var initialWidth = preview.offsetWidth;
    var initialHeight = preview.offsetHeight;

    __WEBPACK_IMPORTED_MODULE_1_interactjs___default()(preview).draggable({
      onmove: dragMoveListener
    }).resizable({
      preserveAspectRatio: true,
      edges: { left: true, right: true, bottom: true, top: true }
    }).on('resizemove', function (event) {
      var target = event.target;
      var x = parseFloat(target.getAttribute('data-x')) || 0;
      var y = parseFloat(target.getAttribute('data-y')) || 0;

      var eventWidth = event.rect.width;
      var eventHeight = event.rect.height;

      var maxWidth = initialWidth * 4;
      var maxHeight = initialHeight * 4;

      if (eventWidth >= maxWidth) eventWidth = maxWidth;
      if (eventHeight >= maxHeight) eventHeight = maxHeight;
      if (eventWidth <= initialWidth) eventWidth = initialWidth;
      if (eventHeight <= initialHeight) eventHeight = initialHeight;

      // update the element's style
      target.style.width = eventWidth + 'px';
      target.style.height = eventHeight + 'px';

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      var maxX = window.innerWidth - (10 + target.offsetWidth);
      var maxY = window.innerHeight - (10 + target.offsetHeight);
      var minX = 10;
      var minY = 10;

      if (x >= maxX) x = maxX;
      if (y >= maxY) y = maxY;
      if (x <= minX) x = minX;
      if (y <= minY) y = minY;

      target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    });

    var x = window.innerWidth - (10 + preview.offsetWidth);
    var y = window.innerHeight - (10 + preview.offsetHeight);
    preview.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    preview.setAttribute('data-x', x);
    preview.setAttribute('data-y', y);
  }
});

/***/ }),

/***/ 915:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'rangeControl',
  props: ['module', 'meta'],
  computed: {
    value: {
      get: function get() {
        return this.$store.state.modVModules.active[this.moduleName][this.variable];
      },
      set: function set(value) {
        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data: value
        });
      }
    },
    variable: function variable() {
      return this.meta.$modv_variable;
    },
    moduleName: function moduleName() {
      return this.meta.$modv_moduleName;
    },
    label: function label() {
      return this.meta.label || this.variable;
    },
    inputId: function inputId() {
      return this.moduleName + '-' + this.variable;
    }
  },
  beforeMount: function beforeMount() {
    if (typeof this.value === 'undefined') this.value = this.defaultValue;
  },

  methods: {
    labelClicked: function labelClicked() {
      this.value = !this.value;
    }
  }
});

/***/ }),

/***/ 916:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_color__ = __webpack_require__(744);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_color___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue_color__);
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'colorControl',
  props: ['module', 'meta'],
  data: function data() {
    return {
      pickerColors: {}
    };
  },

  computed: {
    value: {
      get: function get() {
        return this.$store.state.modVModules.active[this.moduleName][this.variable];
      },
      set: function set(value) {
        var data = this[this.options.returnFormat || 'rgbaArray'](value);

        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data: data
        });
      }
    },
    options: function options() {
      return this.meta.control.options;
    },
    variable: function variable() {
      return this.meta.$modv_variable;
    },
    moduleName: function moduleName() {
      return this.meta.$modv_moduleName;
    },
    inputId: function inputId() {
      return this.moduleName + '-' + this.variable;
    },
    label: function label() {
      return this.meta.label || this.variable;
    }
  },
  mounted: function mounted() {
    this.$refs.colorPicker.inputChange(this.value);
    var data = this[this.options.returnFormat || 'rgbaArray'](this.$refs.colorPicker.val);

    this.$store.dispatch('modVModules/updateProp', {
      name: this.moduleName,
      prop: this.variable,
      data: data
    });
  },

  methods: {
    rgbArray: function rgbArray(value) {
      if (!('rgba' in value)) return [0, 0, 0];

      var rgba = value.rgba;
      return [rgba.r, rgba.g, rgba.b];
    },
    rgbString: function rgbString(value) {
      if (!('rgba' in value)) return [0, 0, 0, 0];

      var rgba = value.rgba;

      return 'rgb(' + rgba.r + ', ' + rgba.g + ', ' + rgba.b + ')';
    },
    rgbaString: function rgbaString(value) {
      if (!('rgba' in value)) return [0, 0, 0, 0];

      var rgba = value.rgba;

      return 'rgba(' + rgba.r + ', ' + rgba.g + ', ' + rgba.b + ', ' + rgba.a + ')';
    },
    rgbaArray: function rgbaArray(value) {
      if (!('rgba' in value)) return [0, 0, 0, 0];

      var rgba = value.rgba;
      return [rgba.r, rgba.g, rgba.b, rgba.a];
    },
    mappedRgbaArray: function mappedRgbaArray(value) {
      if (!('rgba' in value)) return [0, 0, 0, 0];

      var rgba = value.rgba;
      var red = Math.map(rgba.r, 0, 255, 0.0, 1.0);
      var green = Math.map(rgba.g, 0, 255, 0.0, 1.0);
      var blue = Math.map(rgba.b, 0, 255, 0.0, 1.0);
      var alpha = Math.map(rgba.a, 0, 1, 0.0, 1.0);

      return [red, green, blue, alpha];
    },
    hexString: function hexString(value) {
      return value.hex;
    },
    hsvArray: function hsvArray(value) {
      if (!('hsv' in value)) return [0, 0, 0];

      var hsv = value.hsv;
      return [hsv.r, hsv.g, hsv.b];
    },

    // hsvString(value) {

    // },
    hsvaArray: function hsvaArray(value) {
      if (!('hsv' in value)) return [0, 0, 0, 0];

      var hsva = value.hsv;
      return [hsva.r, hsva.g, hsva.b, hsva.a];
    },

    // hsvaString(value) {

    // },
    hslArray: function hslArray(value) {
      if (!('hsl' in value)) return [0, 0, 0];

      var hsl = value.hsl;
      return [hsl.r, hsl.g, hsl.b];
    },

    // hslString(value) {

    // },
    hslaArray: function hslaArray(value) {
      if (!('hsl' in value)) return [0, 0, 0, 0];

      var hsla = value.hsl;
      return [hsla.r, hsla.g, hsla.b, hsla.a];
    }
  },
  components: {
    'sketch-picker': __WEBPACK_IMPORTED_MODULE_0_vue_color__["Sketch"]
  }
});

/***/ }),

/***/ 917:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__generate_control_data__ = __webpack_require__(597);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ColorControl__ = __webpack_require__(746);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ColorControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__ColorControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__CheckboxControl__ = __webpack_require__(745);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__CheckboxControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__CheckboxControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ImageControl__ = __webpack_require__(747);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ImageControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__ImageControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__PaletteControl__ = __webpack_require__(748);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__PaletteControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__PaletteControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__RangeControl__ = __webpack_require__(749);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__RangeControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__RangeControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__SelectControl__ = __webpack_require__(750);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__SelectControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__SelectControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__TextControl__ = __webpack_require__(751);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__TextControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__TextControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__TwoDPointControl__ = __webpack_require__(752);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__TwoDPointControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__TwoDPointControl__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//












/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'groupConrol',
  props: ['meta', 'module'],
  data: function data() {
    return {
      currentGroup: 0
    };
  },

  computed: {
    group: function group() {
      return this.$store.state.modVModules.active[this.meta.$modv_moduleName][this.meta.$modv_variable];
    },
    groupProps: function groupProps() {
      return this.group.props;
    },
    groupLength: function groupLength() {
      return this.group.length;
    },
    controls: function controls() {
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__generate_control_data__["a" /* default */])({
        module: this.module,
        props: this.$store.state.modVModules.active[this.meta.$modv_moduleName].props[this.meta.$modv_variable].props,
        exclude: ['group'],
        group: this.currentGroup,
        groupName: this.meta.$modv_variable
      });
    }
  },
  methods: {
    addGroup: function addGroup() {
      this.$store.commit('modVModules/incrementGroup', {
        moduleName: this.meta.$modv_moduleName,
        groupName: this.meta.$modv_variable
      });
    },
    removeGroup: function removeGroup() {
      this.$store.commit('modVModules/decrementGroup', {
        moduleName: this.meta.$modv_moduleName,
        groupName: this.meta.$modv_variable
      });
    }
  },
  components: {
    colorControl: __WEBPACK_IMPORTED_MODULE_1__ColorControl___default.a,
    checkboxControl: __WEBPACK_IMPORTED_MODULE_2__CheckboxControl___default.a,
    imageControl: __WEBPACK_IMPORTED_MODULE_3__ImageControl___default.a,
    paletteControl: __WEBPACK_IMPORTED_MODULE_4__PaletteControl___default.a,
    rangeControl: __WEBPACK_IMPORTED_MODULE_5__RangeControl___default.a,
    selectControl: __WEBPACK_IMPORTED_MODULE_6__SelectControl___default.a,
    textControl: __WEBPACK_IMPORTED_MODULE_7__TextControl___default.a,
    twoDPointControl: __WEBPACK_IMPORTED_MODULE_8__TwoDPointControl___default.a
  }
});

/***/ }),

/***/ 918:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'imageControl',
  props: ['meta'],
  data: function data() {
    return {
      currentLayerIndex: -1,
      source: 'layer',
      sources: ['layer', 'image', 'video']
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('layers', {
    layers: 'allLayers'
  }), {
    layerNames: function layerNames() {
      var _this = this;

      var data = [];
      var allLayers = this.layers;

      if (allLayers.length < 1) return data;

      data.push({
        label: 'Inherit',
        value: -1,
        selected: typeof this.currentLayerIndex === 'undefined'
      });

      allLayers.forEach(function (Layer, idx) {
        var name = Layer.name;
        data.push({
          label: name,
          value: idx,
          selected: _this.currentLayerIndex === idx
        });
      });

      return data;
    },

    value: {
      get: function get() {
        return this.$store.state.modVModules.active[this.moduleName][this.variable];
      },
      set: function set(value) {
        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data: {
            source: this.source,
            sourceData: value
          }
        });
      }
    },
    variable: function variable() {
      return this.meta.$modv_variable;
    },
    label: function label() {
      return this.meta.label || this.variable;
    },
    moduleName: function moduleName() {
      return this.meta.$modv_moduleName;
    },
    currentLayer: function currentLayer() {
      return this.layers[this.currentLayerIndex];
    },
    inputId: function inputId() {
      return this.moduleName + '-' + this.variable;
    },
    selectedLabel: function selectedLabel() {
      return this.currentLayerIndex < 0 ? 'Inherit' : this.layers[this.currentLayerIndex].name;
    }
  }),
  mounted: function mounted() {
    if (this.value && this.value.sourceData) {
      this.currentLayerIndex = this.value.sourceData;
    }
  },

  watch: {
    currentLayerIndex: function currentLayerIndex(value) {
      this.value = value;
    }
  }
});

/***/ }),

/***/ 919:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator__ = __webpack_require__(258);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator__ = __webpack_require__(257);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_object_keys__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_object_keys___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_object_keys__);



//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'modulePresetSelector',

  props: {
    presets: {
      type: Object,
      required: true
    },
    moduleName: {
      type: String,
      required: true
    }
  },

  data: function data() {
    return {
      preset: 'Select'
    };
  },


  methods: {
    load: function load() {
      var _this = this;

      __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_object_keys___default()(this.presets[this.preset].props).forEach(function () {
        var _ref = __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator___default()( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default.a.mark(function _callee(prop) {
          var data;
          return __WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  data = _this.presets[_this.preset].props[prop];
                  _context.next = 3;
                  return _this.$store.dispatch('modVModules/resetModule', { name: _this.moduleName });

                case 3:

                  _this.$store.dispatch('modVModules/updateProp', {
                    name: _this.moduleName,
                    prop: prop,
                    data: data
                  });

                case 4:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }
});

/***/ }),

/***/ 920:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuex__ = __webpack_require__(11);


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'paletteSelector',
  props: ['value', 'project'],
  data: function data() {
    return {
      currentPalette: null
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["b" /* mapGetters */])('projects', ['allProjects']), {
    selectData: function selectData() {
      var data = [];
      var allProjects = this.allProjects;

      if (!Object.prototype.hasOwnProperty.call(allProjects, this.project)) return [];
      var project = allProjects[this.project];

      __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default()(project.palettes).forEach(function (paletteName) {
        data.push({
          label: paletteName,
          value: paletteName
        });
      });

      data.sort(function (a, b) {
        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        return 0;
      });

      return data;
    }
  }),
  watch: {
    currentPalette: function currentPalette() {
      this.$emit('input', this.currentPalette);
    }
  }
});

/***/ }),

/***/ 921:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuedraggable__ = __webpack_require__(1760);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuedraggable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_vuedraggable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vue_color__ = __webpack_require__(744);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vue_color___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_vue_color__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__PaletteSelector__ = __webpack_require__(1679);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__PaletteSelector___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__PaletteSelector__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ProjectSelector__ = __webpack_require__(1680);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ProjectSelector___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__ProjectSelector__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//








var defaultProps = {
  hex: '#194d33',
  hsl: {
    h: 150,
    s: 0.5,
    l: 0.2,
    a: 1
  },
  hsv: {
    h: 150,
    s: 0.66,
    v: 0.30,
    a: 1
  },
  rgba: {
    r: 25,
    g: 77,
    b: 51,
    a: 1
  },
  a: 1
};

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'paletteControl',
  props: ['module', 'meta'],
  data: function data() {
    return {
      dragOptions: {
        group: {
          name: 'palette',
          pull: true,
          put: true
        }
      },
      durationInput: undefined,
      pickerColors: defaultProps,
      showPicker: false,
      useBpmInput: false,
      bpmDivisionInput: 16,
      projectSelectorInput: 'default',
      paletteSelectorInput: '',
      savePaletteNameInput: ''
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({
    options: function options() {
      return this.meta.control.options;
    },
    moduleName: function moduleName() {
      return this.meta.$modv_moduleName;
    },
    inputId: function inputId() {
      return this.moduleName + '-' + this.variable;
    },

    value: {
      get: function get() {
        return this.$store.state.modVModules.active[this.moduleName][this.variable];
      },
      set: function set(value) {
        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data: value
        });
      }
    },
    variable: function variable() {
      return this.meta.$modv_variable;
    },
    label: function label() {
      return this.meta.label || this.variable;
    },
    defaultValue: function defaultValue() {
      return this.options.colors;
    }
  }, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('palettes', ['allPalettes']), {
    palette: function palette() {
      return this.$store.state.palettes.palettes[this.moduleName + '-' + this.variable];
    },

    colors: {
      get: function get() {
        return this.palette.colors;
      },
      set: function set(value) {
        this.updateColors({
          id: this.inputId,
          colors: value
        });
      }
    },
    duration: function duration() {
      return this.palette.duration;
    },
    useBpm: function useBpm() {
      return this.palette.useBpm;
    },
    bpmDivision: function bpmDivision() {
      return this.palette.bpmDivision;
    },
    pickerButtonText: function pickerButtonText() {
      return this.showPicker ? 'Hide' : 'Show';
    },
    currentColor: function currentColor() {
      return this.palette.currentColor;
    },
    toColor: function toColor() {
      var nextColor = this.palette.currentColor + 1;
      if (nextColor > this.colors.length - 1) return 0;
      return nextColor;
    }
  }),
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('palettes', ['createPalette', 'updateColors', 'updateDuration', 'updateUseBpm', 'updateBpmDivision']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('projects', ['getPaletteFromProject']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('projects', ['savePaletteToProject']), {
    addSwatch: function addSwatch() {
      var updatedColors = this.colors.slice();
      updatedColors.push(this.pickerColors.rgba);

      this.updateColors({
        id: this.inputId,
        colors: updatedColors
      });
    },
    removeSwatch: function removeSwatch(idx) {
      var updatedColors = this.colors.slice();
      updatedColors.splice(idx, 1);

      this.updateColors({
        id: this.inputId,
        colors: updatedColors
      });
    },
    togglePicker: function togglePicker() {
      this.showPicker = !this.showPicker;
    },
    clickLoadPalette: function clickLoadPalette() {
      var palette = this.getPaletteFromProject()({
        paletteName: this.paletteSelectorInput,
        projectName: this.projectSelectorInput
      });

      if (Array.isArray(palette)) {
        palette = palette.map(function (c) {
          return { r: c[0], g: c[1], b: c[2] };
        });
      }

      this.updateColors({
        id: this.inputId,
        colors: palette
      });
    },
    clickSavePalette: function clickSavePalette() {
      this.savePaletteToProject({
        projectName: this.projectSelectorInput,
        paletteName: this.savePaletteNameInput,
        colors: this.colors
      });
    }
  }),
  beforeMount: function beforeMount() {
    this.value = this.module[this.variable];
    if (typeof this.value === 'undefined') this.value = this.options.colors;

    this.durationInput = this.duration;
    this.useBpmInput = this.useBpm;
    this.bpmDivisionInput = this.bpmDivision;
  },

  watch: {
    module: function module() {
      this.value = this.module[this.variable];
    },
    value: function value() {
      this.module[this.variable] = this.value;
    },
    durationInput: function durationInput() {
      this.updateDuration({
        id: this.inputId,
        duration: this.durationInput
      });
    },
    useBpmInput: function useBpmInput() {
      this.updateUseBpm({
        id: this.inputId,
        useBpm: this.useBpmInput
      });
    },
    bpmDivisionInput: function bpmDivisionInput() {
      this.updateBpmDivision({
        id: this.inputId,
        bpmDivision: this.bpmDivisionInput
      });
    }
  },
  components: {
    'sketch-picker': __WEBPACK_IMPORTED_MODULE_3_vue_color__["Sketch"],
    PaletteSelector: __WEBPACK_IMPORTED_MODULE_4__PaletteSelector___default.a,
    ProjectSelector: __WEBPACK_IMPORTED_MODULE_5__ProjectSelector___default.a,
    draggable: __WEBPACK_IMPORTED_MODULE_2_vuedraggable___default.a
  }
});

/***/ }),

/***/ 922:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuex__ = __webpack_require__(11);


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'projectSelector',
  props: ['value'],
  data: function data() {
    return {
      currentProject: 'default'
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["b" /* mapGetters */])('projects', ['allProjects']), {
    projectNames: function projectNames() {
      var _this = this;

      var data = [];
      var allProjects = this.allProjects;

      __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default()(allProjects).forEach(function (projectName) {
        data.push({
          label: projectName,
          value: projectName,
          selected: _this.currentProject === projectName
        });
      });

      return data;
    }
  }),
  watch: {
    currentProject: function currentProject() {
      this.$emit('input', this.currentProject);
    }
  }
});

/***/ }),

/***/ 923:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_nwjs_menu_browser__ = __webpack_require__(98);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



if (!window.nw) {
  window.nw = {
    Menu: __WEBPACK_IMPORTED_MODULE_0_nwjs_menu_browser__["a" /* Menu */],
    MenuItem: __WEBPACK_IMPORTED_MODULE_0_nwjs_menu_browser__["b" /* MenuItem */]
  };
}

var nw = window.nw;

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'rangeControl',
  props: ['meta'],
  data: function data() {
    return {
      menuOptions: {
        match: ['rangeControl'],
        menuItems: []
      },
      updateQueue: [],
      currentValue: 0,
      raf: null,
      lastLength: 0,
      context: null,
      mousePressed: false,
      canvasX: 0
    };
  },

  computed: {
    group: function group() {
      return this.meta.$modv_group;
    },
    groupName: function groupName() {
      return this.meta.$modv_groupName;
    },
    moduleName: function moduleName() {
      return this.meta.$modv_moduleName;
    },
    inputId: function inputId() {
      return this.moduleName + '-' + this.variable;
    },

    value: {
      get: function get() {
        if (this.meta.$modv_group || this.meta.$modv_groupName) {
          return this.$store.state.modVModules.active[this.moduleName][this.meta.$modv_groupName].props[this.variable][this.meta.$modv_group];
        }

        return this.$store.state.modVModules.active[this.moduleName][this.variable];
      },
      set: function set(value) {
        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data: value,
          group: this.meta.$modv_group,
          groupName: this.meta.$modv_groupName
        });
      }
    },
    variable: function variable() {
      return this.meta.$modv_variable;
    },
    label: function label() {
      return this.meta.label || this.variable;
    },
    min: function min() {
      return this.meta.min || 0;
    },
    max: function max() {
      return this.meta.max || 1;
    },
    step: function step() {
      return this.meta.step || 1;
    },
    defaultValue: function defaultValue() {
      return this.meta.default;
    },
    strict: function strict() {
      return this.meta.strict || false;
    }
  },
  methods: {
    mapValue: function mapValue(x) {
      var mappedX = Math.map(x, 0, 170, this.min, this.max);
      return this.formatValue(+mappedX.toFixed(2));
    },
    unmapValue: function unmapValue(x) {
      var unmappedX = Math.map(x, this.min, this.max, 0, 170);
      return unmappedX;
    },
    mouseDown: function mouseDown() {
      this.mousePressed = true;
    },
    mouseUp: function mouseUp() {
      this.mousePressed = false;
    },
    mouseMove: function mouseMove(e) {
      if (!this.mousePressed) return;
      this.calculateValues(e);
    },
    touchstart: function touchstart() {
      this.mousePressed = true;
    },
    touchmove: function touchmove(e) {
      this.calculateValues(e);
    },
    touchend: function touchend() {
      this.mousePressed = false;
    },
    click: function click(e) {
      this.calculateValues(e, true);
    },
    calculateValues: function calculateValues(e) {
      var clicked = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var rect = this.$refs.canvas.getBoundingClientRect();
      var clientX = void 0;
      // let clientY;
      // let divisor = 1;

      if ('clientX' in e) {
        clientX = e.clientX;
        // clientY = e.clientY;
      } else {
        e.preventDefault();
        clientX = e.targetTouches[0].clientX;
        // clientY = e.targetTouches[0].clientY;
      }

      // if (
      //   clientY > rect.top + rect.height ||
      //   clientY < rect.top
      // ) {
      //   divisor = Math.max(1, Math.abs(clientY - rect.top) / 200);
      //   console.log(divisor, clientX, clientX / divisor);
      // }

      var x = /* ( */clientX /* / divisor) */ - Math.round(rect.left);

      if (this.meta.abs && x < 0) {
        x = 0;
      }

      if (this.mousePressed || clicked) {
        this.value = this.mapValue(x);
        // this.canvasX = x;
        // this.currentX = this.value;
      }
    },
    formatValue: function formatValue(valueIn) {
      var value = valueIn;

      if (this.strict) {
        if (value < this.min) {
          value = this.min;
        }

        if (value > this.max) {
          value = this.max;
        }

        if (this.varType === 'int') {
          value = parseInt(value, 10);
        }
      }

      return value;
    },
    draw: function draw() {
      var x = this.canvasX;
      var canvas = this.$refs.canvas;
      var context = this.context;

      context.fillStyle = '#393939';
      context.fillRect(0, 0, canvas.width, canvas.height);

      if (x > 0) {
        context.fillStyle = '#ffa500';
        context.fillRect(0, 0, x, canvas.height);
      } else {
        context.fillStyle = '#005aff';
        context.fillRect(0, 0, Math.abs(x), canvas.height);
      }
    }
  },
  beforeMount: function beforeMount() {
    this.currentValue = this.processedValue || this.defaultValue;

    this.$data.menuOptions.menuItems.push(new nw.MenuItem({
      label: this.label,
      enabled: false
    }), new nw.MenuItem({
      type: 'separator'
    }));
  },
  mounted: function mounted() {
    window.addEventListener('mouseup', this.mouseUp.bind(this));
    window.addEventListener('mousemove', this.mouseMove.bind(this));
    this.$refs.canvas.width = 170;
    this.$refs.canvas.height = 32;
    this.context = this.$refs.canvas.getContext('2d');
    this.canvasX = this.unmapValue(this.value);
    this.draw();
  },
  destroy: function destroy() {
    window.removeEventListener('mouseup', this.mouseUp.bind(this));
    window.removeEventListener('mousemove', this.mouseMove.bind(this));
  },

  watch: {
    value: function value(_value) {
      this.canvasX = this.unmapValue(_value);
    },
    canvasX: function canvasX() {
      this.draw();
    }
  }
});

/***/ }),

/***/ 924:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'selectControl',
  props: ['module', 'meta'],
  computed: {
    moduleName: function moduleName() {
      return this.meta.$modv_moduleName;
    },
    inputId: function inputId() {
      return this.moduleName + '-' + this.variable;
    },

    value: {
      get: function get() {
        return this.$store.state.modVModules.active[this.moduleName][this.variable];
      },
      set: function set(value) {
        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data: value
        });
      }
    },
    variable: function variable() {
      return this.meta.$modv_variable;
    },
    label: function label() {
      return this.meta.label || this.variable;
    },
    enumVals: function enumVals() {
      return this.meta.enum;
    },
    selectedLabel: function selectedLabel() {
      var _this = this;

      if (typeof this.value === 'undefined') return -1;
      return this.meta.enum.find(function (enumValue) {
        return enumValue.value === _this.value;
      }).label;
    }
  }
});

/***/ }),

/***/ 925:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_nwjs_menu_browser__ = __webpack_require__(98);
//
//
//
//
//
//
//
//
//
//
//



if (!window.nw) {
  window.nw = {
    Menu: __WEBPACK_IMPORTED_MODULE_0_nwjs_menu_browser__["a" /* Menu */],
    MenuItem: __WEBPACK_IMPORTED_MODULE_0_nwjs_menu_browser__["b" /* MenuItem */]
  };
}

var nw = window.nw;

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'textControl',
  props: ['meta'],
  data: function data() {
    return {
      menuOptions: {
        match: ['textControl'],
        menuItems: []
      }
    };
  },

  computed: {
    moduleName: function moduleName() {
      return this.meta.$modv_moduleName;
    },
    inputId: function inputId() {
      return this.moduleName + '-' + this.variable;
    },

    value: {
      get: function get() {
        return this.$store.state.modVModules.active[this.moduleName][this.variable];
      },
      set: function set(value) {
        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data: value
        });
      }
    },
    variable: function variable() {
      return this.meta.$modv_variable;
    },
    label: function label() {
      return this.meta.label || this.variable;
    }
  },
  beforeMount: function beforeMount() {
    this.$data.menuOptions.menuItems.push(new nw.MenuItem({
      label: this.label,
      enabled: false
    }), new nw.MenuItem({
      type: 'separator'
    }));
  }
});

/***/ }),

/***/ 926:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'twoDPointControl',
  props: ['meta'],
  data: function data() {
    return {
      context: null,
      mousePressed: false,
      canvasCoords: [65.5, 65.5],
      currentX: 0,
      currentY: 0,
      inputX: 0,
      inputY: 0
    };
  },

  computed: {
    value: {
      get: function get() {
        return this.$store.state.modVModules.active[this.moduleName][this.variable];
      },
      set: function set(value) {
        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data: value
        });
      }
    },
    moduleName: function moduleName() {
      return this.meta.$modv_moduleName;
    },
    inputId: function inputId() {
      return this.moduleName + '-' + this.variable;
    },
    label: function label() {
      return this.meta.label;
    },
    variable: function variable() {
      return this.meta.$modv_variable;
    },
    min: function min() {
      var min = isNaN(this.meta.min) ? -1.0 : this.meta.min;
      min = Array.isArray(this.meta.min) ? this.meta.min[0] : min;
      return min;
    },
    max: function max() {
      var max = isNaN(this.meta.max) ? 1.0 : this.meta.max;
      max = Array.isArray(this.meta.max) ? this.meta.max[0] : max;
      return max;
    },
    step: function step() {
      return this.meta.step || 0.01;
    },
    defaultValue: function defaultValue() {
      return this.meta.default;
    }
  },
  methods: {
    mapValues: function mapValues(x, y) {
      var mappedX = Math.map(x, 0, 170, this.min, this.max);
      var mappedY = Math.map(y, 170, 0, this.min, this.max);
      return [+mappedX.toFixed(2), +mappedY.toFixed(2)];
    },
    unmapValues: function unmapValues(x, y) {
      var unmappedX = Math.map(x, this.min, this.max, 0, 170);
      var unmappedY = Math.map(y, this.min, this.max, 170, 0);
      return [unmappedX, unmappedY];
    },
    mouseDown: function mouseDown() {
      this.mousePressed = true;
      window.addEventListener('mousemove', this.mouseMove.bind(this));
      window.addEventListener('mouseup', this.mouseUp.bind(this));
      window.addEventListener('touchmove', this.touchMove.bind(this));
      window.addEventListener('touchEnd', this.touchEnd.bind(this));
    },
    mouseUp: function mouseUp() {
      this.mousePressed = false;
      window.removeEventListener('mousemove', this.mouseMove.bind(this));
      window.removeEventListener('mouseup', this.mouseUp.bind(this));
      window.removeEventListener('touchmove', this.touchMove.bind(this));
      window.removeEventListener('touchEnd', this.touchEnd.bind(this));
    },
    mouseMove: function mouseMove(e) {
      if (!this.mousePressed) return;
      this.calculateValues(e);
    },
    touchStart: function touchStart() {
      this.mousePressed = true;
    },
    touchMove: function touchMove(e) {
      if (!this.mousePressed) return;
      this.calculateValues(e);
    },
    touchEnd: function touchEnd() {
      this.mousePressed = false;
    },
    click: function click(e) {
      this.calculateValues(e, true);
    },
    calculateValues: function calculateValues(e) {
      var clicked = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var rect = this.$refs.pad.getBoundingClientRect();

      var clientX = void 0;

      if ('clientX' in e) {
        clientX = e.clientX;
      } else {
        e.preventDefault();
        clientX = e.targetTouches[0].clientX;
      }

      var clientY = void 0;

      if ('clientY' in e) {
        clientY = e.clientY;
      } else {
        clientY = e.targetTouches[0].clientY;
      }

      var x = clientX - Math.round(rect.left);
      var y = clientY - Math.round(rect.top);

      if (this.mousePressed || clicked) {
        this.value = this.mapValues(x, y);
        this.canvasCoords = [x, y];
        this.currentX = this.value[0];
        this.currentY = this.value[1];
      }
    },
    draw: function draw(x, y) {
      var canvas = this.$refs.pad;
      var context = this.context;

      context.fillStyle = '#393939';
      context.fillRect(0, 0, canvas.width, canvas.height);

      this.drawGrid();
      this.drawPosition(Math.round(x) + 0.5, Math.round(y) + 0.5);
    },
    drawGrid: function drawGrid() {
      var canvas = this.$refs.pad;
      var context = this.context;
      var width = canvas.width,
          height = canvas.height;


      context.save();
      context.strokeStyle = '#aaa';
      context.beginPath();
      context.lineWidth = 1;
      var sections = 16;
      var step = width / sections;
      for (var i = 1; i < sections; i += 1) {
        context.moveTo(Math.round(i * step) + 0.5, 0);
        context.lineTo(Math.round(i * step) + 0.5, height);
        context.moveTo(0, Math.round(i * step) + 0.5);
        context.lineTo(width, Math.round(i * step) + 0.5);
      }
      context.stroke();
      context.restore();
    },
    drawPosition: function drawPosition(x, y) {
      var canvas = this.$refs.pad;
      var context = this.context;
      var width = canvas.width,
          height = canvas.height;

      context.lineWidth = 1;
      context.strokeStyle = '#ffa600';

      if (x < Math.round(width / 2)) context.strokeStyle = '#005aff';

      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();

      if (y <= Math.round((height + 1) / 2)) context.strokeStyle = '#ffa600';else context.strokeStyle = '#005aff';

      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();

      if (x < Math.round(width / 2) && y > Math.round(height / 2)) {
        context.strokeStyle = '#005aff';
      } else {
        context.strokeStyle = '#ffa600';
      }

      context.beginPath();
      context.arc(x, y, 6, 0, 2 * Math.PI, true);
      context.stroke();
    },
    xInput: function xInput(value) {
      this.inputX = parseFloat(value);
      this.value = [value, this.inputY];
      this.canvasCoords = this.unmapValues(value, this.inputY);
    },
    yInput: function yInput(value) {
      this.inputY = parseFloat(value);
      this.value = [this.inputX, value];
      this.canvasCoords = this.unmapValues(this.inputX, value);
    }
  },
  mounted: function mounted() {
    this.$refs.pad.width = 170;
    this.$refs.pad.height = 170;
    this.context = this.$refs.pad.getContext('2d');
    this.canvasCoords = this.unmapValues(this.value[0], this.value[1]);
    this.currentX = this.value[0];
    this.currentY = this.value[1];
  },

  watch: {
    value: function value() {
      this.currentX = this.value[0];
      this.currentY = this.value[1];
    },
    canvasCoords: function canvasCoords() {
      this.draw(this.canvasCoords[0], this.canvasCoords[1]);
    }
  }
});

/***/ }),

/***/ 927:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__generate_control_data__ = __webpack_require__(597);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ModulePresetSelector__ = __webpack_require__(1678);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ModulePresetSelector___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__ModulePresetSelector__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ColorControl__ = __webpack_require__(746);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ColorControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__ColorControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__CheckboxControl__ = __webpack_require__(745);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__CheckboxControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__CheckboxControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ImageControl__ = __webpack_require__(747);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ImageControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__ImageControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__PaletteControl__ = __webpack_require__(748);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__PaletteControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__PaletteControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__RangeControl__ = __webpack_require__(749);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__RangeControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__RangeControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__SelectControl__ = __webpack_require__(750);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__SelectControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__SelectControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__TextControl__ = __webpack_require__(751);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__TextControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__TextControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__TwoDPointControl__ = __webpack_require__(752);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__TwoDPointControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_11__TwoDPointControl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__GroupControl__ = __webpack_require__(1677);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__GroupControl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12__GroupControl__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

















/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'controlPanel',
  props: {
    moduleName: String,
    pinned: { default: false },
    focused: { type: Boolean, default: false }
  },
  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('modVModules', ['getActiveModule']), {
    module: function module() {
      if (!this.moduleName) return false;
      return this.$store.getters['modVModules/outerActive'][this.moduleName];
    },
    name: function name() {
      if (!this.module) return '';
      return this.module.meta.name;
    },
    controls: function controls() {
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__generate_control_data__["a" /* default */])({
        module: this.module
      });
    },
    pinTitle: function pinTitle() {
      return this.pinned ? 'Unpin' : 'Pin';
    }
  }),
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["d" /* mapMutations */])('controlPanels', ['pinPanel', 'unpinPanel']), {
    pin: function pin() {
      if (!this.pinned) {
        this.pinPanel({ moduleName: this.name });
      } else {
        this.unpinPanel({ moduleName: this.name });
      }
    }
  }),
  components: {
    colorControl: __WEBPACK_IMPORTED_MODULE_4__ColorControl___default.a,
    checkboxControl: __WEBPACK_IMPORTED_MODULE_5__CheckboxControl___default.a,
    imageControl: __WEBPACK_IMPORTED_MODULE_6__ImageControl___default.a,
    paletteControl: __WEBPACK_IMPORTED_MODULE_7__PaletteControl___default.a,
    rangeControl: __WEBPACK_IMPORTED_MODULE_8__RangeControl___default.a,
    selectControl: __WEBPACK_IMPORTED_MODULE_9__SelectControl___default.a,
    textControl: __WEBPACK_IMPORTED_MODULE_10__TextControl___default.a,
    twoDPointControl: __WEBPACK_IMPORTED_MODULE_11__TwoDPointControl___default.a,
    modulePresetSelector: __WEBPACK_IMPORTED_MODULE_3__ModulePresetSelector___default.a,
    groupControl: __WEBPACK_IMPORTED_MODULE_12__GroupControl___default.a
  }
});

/***/ }),

/***/ 928:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_ControlPanel__ = __webpack_require__(1681);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_ControlPanel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_ControlPanel__);

//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'controlPanelHandler',
  data: function data() {
    return {};
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('controlPanels', ['pinnedPanels']), {
    focusedModule: function focusedModule() {
      return this.$store.getters['modVModules/focusedModule'];
    },
    focusedModuleName: function focusedModuleName() {
      return this.$store.state.modVModules.focusedModule;
    },
    panels: function panels() {
      var panels = [].concat(this.pinnedPanels);

      if (this.focusedModule && !this.isPinned(this.focusedModuleName)) {
        panels.push(this.focusedModuleName);
      }

      return panels;
    }
  }),
  methods: {
    isPinned: function isPinned(moduleName) {
      return this.pinnedPanels.indexOf(moduleName) > -1;
    },
    isFocused: function isFocused(moduleName) {
      return moduleName === this.focusedModuleName;
    }
  },
  components: {
    ControlPanel: __WEBPACK_IMPORTED_MODULE_2__components_ControlPanel___default.a
  }
});

/***/ }),

/***/ 929:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vue_smooth_dnd__ = __webpack_require__(563);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vue_smooth_dnd___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_vue_smooth_dnd__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_GalleryItem__ = __webpack_require__(753);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_GalleryItem___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__components_GalleryItem__);


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'moduleGallery',
  components: {
    GalleryItem: __WEBPACK_IMPORTED_MODULE_4__components_GalleryItem___default.a,
    Container: __WEBPACK_IMPORTED_MODULE_3_vue_smooth_dnd__["Container"],
    Draggable: __WEBPACK_IMPORTED_MODULE_3_vue_smooth_dnd__["Draggable"]
  },
  props: {
    phrase: {
      type: String,
      required: true,
      default: ''
    }
  },
  computed: __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["b" /* mapGetters */])('modVModules', {
    currentDragged: 'currentDragged',
    modules: 'registry'
  }), {
    moduleShader: function moduleShader() {
      var _this = this;

      return __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default()(this.modules).filter(function (key) {
        return _this.modules[key].meta.type === 'shader';
      });
    },
    module2d: function module2d() {
      var _this2 = this;

      return __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default()(this.modules).filter(function (key) {
        return _this2.modules[key].meta.type === '2d';
      });
    },
    moduleIsf: function moduleIsf() {
      var _this3 = this;

      return __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default()(this.modules).filter(function (key) {
        return _this3.modules[key].meta.type === 'isf';
      });
    }
  }),
  methods: {
    search: function search(textIn, termIn) {
      var text = textIn.toLowerCase().trim();
      var term = termIn.toLowerCase().trim();
      if (termIn.length < 1) return true;

      return text.indexOf(term) > -1;
    },
    getChildPayload: function getChildPayload(group, index) {
      var moduleName = this[group][index];

      if (group === 'modules') {
        moduleName = __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default()(this.modules)[index];
      }

      return { moduleName: moduleName, collection: 'gallery' };
    }
  }
});

/***/ }),

/***/ 930:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'paletteGallery',
  components: {},
  props: {
    phrase: {
      type: String,
      required: true,
      default: ''
    }
  },
  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('projects', {
    projects: 'allProjects'
  })),
  methods: {
    search: function search(textIn, termIn) {
      var text = textIn.toLowerCase().trim();
      var term = termIn.toLowerCase().trim();
      if (termIn.length < 1) return true;

      return text.indexOf(term) > -1;
    },
    makeStyle: function makeStyle(rgb) {
      return {
        backgroundColor: 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'
      };
    }
  }
});

/***/ }),

/***/ 931:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'pluginGallery',
  data: function data() {
    return {
      loading: null
    };
  },

  props: {
    phrase: {
      type: String,
      required: true,
      default: ''
    }
  },
  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('plugins', ['plugins'])),
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('plugins', ['save', 'setEnabled']), {
    search: function search(textIn, termIn) {
      var text = textIn.toLowerCase().trim();
      var term = termIn.toLowerCase().trim();
      if (termIn.length < 1) return true;

      return text.indexOf(term) > -1;
    },
    switchPlugin: function switchPlugin(e, _ref) {
      var pluginName = _ref.pluginName;

      this.setEnabled({ enabled: e, pluginName: pluginName });
    },
    savePluginSettings: function savePluginSettings(_ref2) {
      var pluginName = _ref2.pluginName;

      this.save({ pluginName: pluginName });
    }
  })
});

/***/ }),

/***/ 932:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator__ = __webpack_require__(258);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator__ = __webpack_require__(257);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_object_keys__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_object_keys___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_object_keys__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__modv_utils_natural_sort__ = __webpack_require__(601);




//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'presetGallery',
  data: function data() {
    return {
      loading: null,

      nameError: false,
      nameErrorMessage: 'Preset must have a name',

      projectError: false,
      projectErrorMessage: 'Please select a project',

      newPresetName: '',
      newPresetProject: 'default'
    };
  },

  props: {
    phrase: {
      type: String,
      required: true,
      default: ''
    }
  },
  computed: __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4_vuex__["b" /* mapGetters */])('projects', ['currentProject']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4_vuex__["b" /* mapGetters */])('modVModules', ['registry']), {
    currentProjectName: function currentProjectName() {
      return this.$store.state.projects.currentProject;
    },
    project: function project() {
      var _this = this;

      var data = [];
      if (!this.currentProject) return data;

      __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_object_keys___default()(this.currentProject.presets).sort(__WEBPACK_IMPORTED_MODULE_5__modv_utils_natural_sort__["a" /* default */].compare).forEach(function (presetName) {
        data.push(_this.currentProject.presets[presetName]);
      });

      return data;
    }
  }),
  methods: __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4_vuex__["c" /* mapActions */])('projects', ['loadPresetFromProject', 'savePresetToProject']), {
    search: function search(textIn, termIn) {
      var text = textIn.toLowerCase().trim();
      var term = termIn.toLowerCase().trim();
      if (termIn.length < 1) return true;

      return text.indexOf(term) > -1;
    },
    makeStyle: function makeStyle(rgb) {
      return {
        backgroundColor: 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'
      };
    },
    validateModuleRequirements: function validateModuleRequirements(moduleData) {
      var _this2 = this;

      return __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_object_keys___default()(moduleData).map(function (datumKey) {
        return moduleData[datumKey].originalModuleName;
      }).every(function (moduleName) {
        return __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_object_keys___default()(_this2.registry).indexOf(moduleName) < 0;
      });
    },
    loadPreset: function loadPreset(_ref) {
      var _this3 = this;

      var presetName = _ref.presetName;
      return __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator___default()( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default.a.mark(function _callee() {
        var projectName;
        return __WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                projectName = _this3.currentProjectName;

                _this3.loading = projectName + '.' + presetName;

                _context.next = 4;
                return _this3.loadPresetFromProject({ presetName: presetName, projectName: projectName });

              case 4:
                _this3.loading = null;

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this3);
      }))();
    },
    savePreset: function savePreset() {
      var _this4 = this;

      return __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator___default()( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default.a.mark(function _callee2() {
        return __WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default.a.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this4.nameError = false;
                _this4.projectError = false;

                if (_this4.newPresetName.trim().length) {
                  _context2.next = 5;
                  break;
                }

                _this4.nameError = true;
                return _context2.abrupt('return');

              case 5:
                if (_this4.newPresetProject.trim().length) {
                  _context2.next = 8;
                  break;
                }

                _this4.projectError = true;
                return _context2.abrupt('return');

              case 8:
                _context2.next = 10;
                return _this4.savePresetToProject({
                  presetName: _this4.newPresetName,
                  projectName: _this4.currentProjectName
                });

              case 10:

                _this4.newPresetName = '';

              case 11:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this4);
      }))();
    }
  })
});

/***/ }),

/***/ 933:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__modv_utils_natural_sort__ = __webpack_require__(601);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__modv__ = __webpack_require__(21);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'projectGallery',
  data: function data() {
    return {
      newProjectName: '',

      nameError: false,
      nameErrorMessage: 'Project must have a name'
    };
  },

  props: {
    phrase: {
      type: String,
      required: true,
      default: ''
    }
  },
  computed: {
    allProjects: function allProjects() {
      return this.$store.state.projects.projects;
    },
    projects: function projects() {
      return __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default()(this.allProjects).sort(__WEBPACK_IMPORTED_MODULE_1__modv_utils_natural_sort__["a" /* default */].compare);
    }
  },
  methods: {
    search: function search(textIn, termIn) {
      var text = textIn.toLowerCase().trim();
      var term = termIn.toLowerCase().trim();
      if (termIn.length < 1) return true;

      return text.indexOf(term) > -1;
    },
    useProject: function useProject(_ref) {
      var projectName = _ref.projectName;

      this.$store.dispatch('projects/setCurrent', { projectName: projectName });
    },
    isCurrent: function isCurrent(projectName) {
      return this.$store.state.projects.currentProject !== projectName;
    },
    newProject: function newProject() {
      var MediaManager = __WEBPACK_IMPORTED_MODULE_2__modv__["a" /* modV */].MediaManagerClient;

      MediaManager.send({
        request: 'make-profile',
        profileName: this.newProjectName
      });
    }
  }
});

/***/ }),

/***/ 934:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_GalleryItem__ = __webpack_require__(753);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_GalleryItem___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_GalleryItem__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'searchBar',
  data: function data() {
    return {
      phrase: ''
    };
  },

  computed: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_vuex__["b" /* mapGetters */])({
    modules: 'registeredModules'
  }),
  components: {
    GalleryItem: __WEBPACK_IMPORTED_MODULE_1__components_GalleryItem___default.a
  },
  methods: {
    focus: function focus() {
      // nothing here, but seems to be required for shortkey
    },
    clearSearch: function clearSearch() {
      if (this.$refs['gallery-search'] !== document.activeElement) return;
      this.phrase = '';
    },
    menuIconClicked: function menuIconClicked() {
      this.$emit('menuIconClicked');
    }
  },
  watch: {
    phrase: function phrase() {
      this.$emit('update:phrase', this.phrase);
    }
  }
});

/***/ }),

/***/ 935:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_Gallery_ModuleGallery__ = __webpack_require__(1683);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_Gallery_ModuleGallery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__components_Gallery_ModuleGallery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_Gallery_PaletteGallery__ = __webpack_require__(1684);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_Gallery_PaletteGallery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__components_Gallery_PaletteGallery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_Gallery_PluginGallery__ = __webpack_require__(1685);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_Gallery_PluginGallery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__components_Gallery_PluginGallery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_Gallery_PresetGallery__ = __webpack_require__(1686);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_Gallery_PresetGallery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__components_Gallery_PresetGallery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_Gallery_ProjectGallery__ = __webpack_require__(1687);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_Gallery_ProjectGallery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__components_Gallery_ProjectGallery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__components_Gallery_SearchBar__ = __webpack_require__(1688);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__components_Gallery_SearchBar___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__components_Gallery_SearchBar__);


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//










/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'gallery',
  data: function data() {
    return {
      currentActiveDrag: null,
      phrase: ''
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["b" /* mapGetters */])('plugins', {
    plugins: 'pluginsWithGalleryTab'
  }), {
    enabledPlugins: function enabledPlugins() {
      var _this = this;

      return __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default()(this.plugins).filter(function (pluginName) {
        return _this.plugins[pluginName].enabled;
      }).reduce(function (obj, pluginName) {
        obj[pluginName] = _this.plugins[pluginName];
        return obj;
      }, {});
    }
  }),
  methods: {
    menuIconClicked: function menuIconClicked() {
      this.$emit('menuIconClicked');
    }
  },
  components: {
    ModuleGallery: __WEBPACK_IMPORTED_MODULE_3__components_Gallery_ModuleGallery___default.a,
    PaletteGallery: __WEBPACK_IMPORTED_MODULE_4__components_Gallery_PaletteGallery___default.a,
    PluginGallery: __WEBPACK_IMPORTED_MODULE_5__components_Gallery_PluginGallery___default.a,
    PresetGallery: __WEBPACK_IMPORTED_MODULE_6__components_Gallery_PresetGallery___default.a,
    ProjectGallery: __WEBPACK_IMPORTED_MODULE_7__components_Gallery_ProjectGallery___default.a,
    SearchBar: __WEBPACK_IMPORTED_MODULE_8__components_Gallery_SearchBar___default.a
  }
});

/***/ }),

/***/ 936:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__modv__ = __webpack_require__(21);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'galleryItem',
  data: function data() {
    return {
      canvas: false,
      context: false,
      Module: false,
      raf: false,
      appendToName: '-gallery',
      isIsf: false
    };
  },

  props: ['moduleName'],
  mounted: function mounted() {
    var _this = this;

    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext('2d');

    this.createActiveModule({
      moduleName: this.moduleName,
      appendToName: this.appendToName,
      skipInit: true
    }).then(function (Module) {
      _this.Module = Module;
      if (Module.meta.type === 'isf') {
        _this.isIsf = true;
      }

      if ('init' in Module) {
        Module.init({
          canvas: { width: _this.canvas.width, height: _this.canvas.height }
        });
      }

      if ('resize' in Module) {
        Module.resize({
          canvas: { width: _this.canvas.width, height: _this.canvas.height }
        });
      }
    }).catch(function (e) {
      console.log('An error occoured whilst initialising a gallery module - ' + _this.Module.meta.name);
      console.error(e);
    });
  },

  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('layers', ['addModuleToLayer']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('modVModules', ['createActiveModule']), {
    draw: function draw(delta) {
      this.raf = requestAnimationFrame(this.draw);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      var features = this.$modV.meyda.get(this.$modV.audioFeatures);

      if (this.Module.meta.previewWithOutput) {
        this.context.drawImage(__WEBPACK_IMPORTED_MODULE_2__modv__["a" /* modV */].outputCanvas, 0, 0, this.canvas.width, this.canvas.height);
      }

      this.Module.draw({
        Module: this.Module,
        canvas: this.canvas,
        context: this.context,
        video: this.$modV.videoStream,
        features: features,
        delta: delta,
        meyda: __WEBPACK_IMPORTED_MODULE_2__modv__["a" /* modV */].meyda._m //eslint-disable-line
      });
    },
    mouseover: function mouseover() {
      if (this.raf) return;
      this.raf = requestAnimationFrame(this.draw);
      // webgl.resize(this.canvas.width, this.canvas.height);
    },
    mouseout: function mouseout() {
      cancelAnimationFrame(this.raf);
      this.raf = false;
    },
    doubleclick: function doubleclick() {
      var _this2 = this;

      this.createActiveModule({
        moduleName: this.moduleName,
        skipInit: false
      }).then(function (Module) {
        _this2.addModuleToLayer({
          module: Module,
          layerIndex: _this2.focusedLayerIndex
        });
      });
    },
    dragstart: function dragstart(e) {
      e.dataTransfer.setData('module-name', this.Module.meta.name);
    }
  }),
  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('layers', ['focusedLayerIndex']), {
    name: function name() {
      var Module = this.Module;
      if (!Module) return '';
      return Module.meta.originalName;
    },
    credit: function credit() {
      if (!this.Module) return '';
      return this.Module.meta.author;
    },
    version: function version() {
      if (!this.Module) return '';
      return this.Module.meta.version;
    },
    isfVersion: function isfVersion() {
      if (!this.Module) return '';
      if (!this.isIsf) return 'N/A';
      var outputString = '' + this.Module.meta.isfVersion;
      if (this.Module.meta.isfVersion === 1) outputString += ' (auto upgraded to 2)';
      return outputString;
    },
    description: function description() {
      if (!this.Module) return '';
      return this.Module.meta.description;
    }
  })
});

/***/ }),

/***/ 937:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_tap_tempo__ = __webpack_require__(1667);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_tap_tempo___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_tap_tempo__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




var tapTempo = new __WEBPACK_IMPORTED_MODULE_2_tap_tempo___default.a();

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'globalControls',
  data: function data() {
    return {
      mediaPathInput: ''
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('mediaStream', ['audioSources', 'videoSources']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('tempo', ['bpm', 'detect']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('user', ['mediaPath']), {

    detect: {
      get: function get() {
        return this.$store.state.tempo.detect;
      },
      set: function set(value) {
        this.$store.commit('tempo/setBpmDetect', {
          detect: value
        });
      }
    },

    constrainToOneOne: {
      get: function get() {
        return this.$store.state.user.constrainToOneOne;
      },
      set: function set(value) {
        this.$store.dispatch('user/setConstrainToOneOne', value);
      }
    },

    retina: {
      get: function get() {
        return this.$store.state.user.useRetina;
      },
      set: function set(value) {
        this.$store.dispatch('user/setUseRetina', { useRetina: value });
      }
    },

    audioSource: {
      get: function get() {
        return this.$store.state.user.currentAudioSource || 'default';
      },
      set: function set(value) {
        this.$store.dispatch('user/setCurrentAudioSource', { sourceId: value });
      }
    },

    videoSource: {
      get: function get() {
        return this.$store.state.user.currentVideoSource || 'default';
      },
      set: function set(value) {
        this.$store.dispatch('user/setCurrentVideoSource', { sourceId: value });
      }
    },

    nameInput: {
      get: function get() {
        return this.$store.state.user.name;
      },
      set: function set(value) {
        this.saveName(value);
      }
    },

    devicePixelRatio: function devicePixelRatio() {
      return window.devicePixelRatio;
    }
  }),
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('tempo', ['setBpm']), {
    tempoTap: function tempoTap() {
      tapTempo.tap();
    },
    saveName: function saveName(value) {
      this.$store.commit('user/setName', { name: value });
    }
  }),
  created: function created() {
    var _this = this;

    tapTempo.on('tempo', function (bpm) {
      if (_this.bpm === Math.round(bpm)) return;
      _this.setBpm({ bpm: Math.round(bpm) });
    });
  }
});

/***/ }),

/***/ 938:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_toConsumableArray__ = __webpack_require__(578);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_toConsumableArray___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_toConsumableArray__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_ActiveModule__ = __webpack_require__(1675);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_ActiveModule___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__components_ActiveModule__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vue_smooth_dnd__ = __webpack_require__(563);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vue_smooth_dnd___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_vue_smooth_dnd__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_nwjs_menu_browser__ = __webpack_require__(98);


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






if (!window.nw) {
  window.nw = {
    Menu: __WEBPACK_IMPORTED_MODULE_5_nwjs_menu_browser__["a" /* Menu */],
    MenuItem: __WEBPACK_IMPORTED_MODULE_5_nwjs_menu_browser__["b" /* MenuItem */]
  };
}

var nw = window.nw;

var applyDrag = function applyDrag(arr, dragResult) {
  var removedIndex = dragResult.removedIndex,
      addedIndex = dragResult.addedIndex,
      payload = dragResult.payload;

  if (removedIndex === null && addedIndex === null) return arr;

  var result = [].concat(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_toConsumableArray___default()(arr));
  var itemToAdd = payload;

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;
};

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'layer',
  props: ['Layer', 'LayerIndex'],
  components: {
    ActiveModule: __WEBPACK_IMPORTED_MODULE_3__components_ActiveModule___default.a,
    Draggable: __WEBPACK_IMPORTED_MODULE_4_vue_smooth_dnd__["Draggable"],
    Container: __WEBPACK_IMPORTED_MODULE_4_vue_smooth_dnd__["Container"]
  },
  data: function data() {
    return {
      menuOptions: {
        match: ['layerItem'],
        menuItems: [],
        createMenus: this.createMenus
      },
      clearingChecked: false,
      inheritChecked: false,
      pipelineChecked: false,
      drawToOutputChecked: false
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({
    modules: {
      get: function get() {
        return this.Layer.moduleOrder;
      },
      set: function set(value) {
        this.updateModuleOrder({ layerIndex: this.LayerIndex, order: value });
      }
    },
    name: function name() {
      if (!this.Layer) return '';
      if (!('name' in this.Layer)) return '';
      return this.Layer.name;
    },
    locked: function locked() {
      return this.Layer.locked;
    },
    collapsed: function collapsed() {
      return this.Layer.collapsed;
    }
  }, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["b" /* mapGetters */])('layers', {
    focusedLayerIndex: 'focusedLayerIndex',
    layers: 'allLayers'
  })),
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["c" /* mapActions */])('layers', ['addLayer', 'toggleLocked', 'toggleCollapsed', 'addModuleToLayer', 'updateModuleOrder', 'moveModuleInstance']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["c" /* mapActions */])('modVModules', ['createActiveModule']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["d" /* mapMutations */])('layers', ['setLayerName', 'setLayerFocus', 'setClearing', 'setInherit', 'setInheritFrom', 'setPipeline', 'setDrawToOutput']), {
    onDrop: function onDrop(e) {
      var _this = this;

      var _e$payload = e.payload,
          moduleName = _e$payload.moduleName,
          collection = _e$payload.collection;


      if (e.addedIndex === null && e.removedIndex === null) return;

      if (collection === 'gallery') {
        this.createActiveModule({ moduleName: moduleName }).then(function (module) {
          _this.addModuleToLayer({
            module: module,
            layerIndex: _this.LayerIndex,
            position: e.addedIndex
          });
        });
      } else if (collection === 'layer') {
        e.payload = moduleName;
        this.modules = applyDrag(this.modules, e);
      }
    },
    getChildPayload: function getChildPayload(e) {
      var moduleName = this.modules[e];

      return { moduleName: moduleName, collection: 'layer', layerIndex: this.LayerIndex };
    },
    startNameEdit: function startNameEdit() {
      var node = this.$el.querySelector('.layer-title');
      if (node.classList.contains('editable')) return;

      node.classList.add('editable');
      node.contentEditable = true;
      node.focus();
      node.addEventListener('blur', this.stopNameEdit);
    },
    stopNameEdit: function stopNameEdit(e) {
      var node = this.$el.querySelector('.layer-title');
      node.removeEventListener('blur', this.stopNameEdit);
      e.preventDefault();

      if (!node.classList.contains('editable')) return;

      var inputText = node.textContent.trim();

      node.contentEditable = false;
      node.classList.remove('editable');

      if (inputText.length > 0) {
        this.setLayerName({
          LayerIndex: this.LayerIndex,
          name: inputText
        });
      } else {
        node.textContent = this.Layer.name;
      }
    },
    focusLayer: function focusLayer() {
      if (this.focusedLayerIndex === this.LayerIndex) return;
      this.setLayerFocus({
        LayerIndex: this.LayerIndex
      });
    },
    clickToggleLock: function clickToggleLock() {
      this.toggleLocked({ layerIndex: this.LayerIndex });
    },
    clickToggleCollapse: function clickToggleCollapse() {
      this.toggleCollapsed({ layerIndex: this.LayerIndex });
    },
    updateChecked: function updateChecked() {
      var Layer = this.Layer;

      this.clearingChecked = Layer.clearing;
      this.inheritChecked = Layer.inherit;
      this.inheritanceIndex = Layer.inheritFrom;
      this.pipelineChecked = Layer.pipeline;
      this.drawToOutputChecked = Layer.drawToOutput;
    },
    createMenus: function createMenus() {
      var _this2 = this;

      var that = this;

      this.menuOptions.menuItems.splice(0, this.menuOptions.menuItems.length);

      // Create inheritance index options

      // <b-dropdown-item value="-1">Last Layer</b-dropdown-item>
      //     <b-dropdown-item
      //       v-for="layer, idx in layers"
      //       :key="idx"
      //       :value="idx"
      //     >{{ layer.name }}</b-dropdown-item>

      var inheritFromSubmenu = new nw.Menu({});

      var item = new nw.MenuItem({
        type: 'checkbox',
        label: 'Last Layer',
        checked: this.Layer.inheritFrom === -1,
        click: function click() {
          that.setInheritFrom({
            layerIndex: that.LayerIndex,
            inheritFrom: -1
          });
        }
      });

      inheritFromSubmenu.append(item);

      this.layers.forEach(function (layer, idx) {
        var item = new nw.MenuItem({
          type: 'checkbox',
          label: layer.name,
          checked: _this2.Layer.inheritFrom === idx,
          click: function click() {
            that.setInheritFrom({
              layerIndex: that.LayerIndex,
              inheritFrom: idx
            });
          }
        });

        inheritFromSubmenu.append(item);
      });

      var inheritFromItem = new nw.MenuItem({
        label: 'Inherit From',
        submenu: inheritFromSubmenu,
        tooltip: 'The Layer to inherit frames from'
      });

      this.menuOptions.menuItems.push(new nw.MenuItem({
        label: this.name,
        enabled: false
      }), new nw.MenuItem({
        type: 'separator'
      }), new nw.MenuItem({
        type: 'checkbox',
        label: 'Clearing',
        tooltip: 'Clear this Layer at the beginning of its draw cycle',
        checked: this.clearingChecked,
        click: function click() {
          that.setClearing({
            layerIndex: that.LayerIndex,
            clearing: this.checked
          });
        }
      }), new nw.MenuItem({
        type: 'checkbox',
        label: 'Inherit',
        tooltip: 'Inherit frames from the \'Inherit From\' Layer',
        checked: this.inheritChecked,
        click: function click() {
          that.setInherit({
            layerIndex: that.LayerIndex,
            inherit: this.checked
          });
        }
      }), inheritFromItem, new nw.MenuItem({
        type: 'checkbox',
        label: 'Pipeline',
        tooltip: 'Modules pass frames directly to the next Module,\n            bypassing drawing to the Layer until the end Module\'s draw cycle'.replace(/\s\s+/g, ' '),
        checked: this.pipelineChecked,
        click: function click() {
          that.setPipeline({
            layerIndex: that.LayerIndex,
            pipeline: this.checked
          });
        }
      }), new nw.MenuItem({
        type: 'checkbox',
        label: 'Draw To Output',
        tooltip: 'Draw the Layer to the Output Window(s) at the end of the Layer\'s draw cycle',
        checked: this.drawToOutputChecked,
        click: function click() {
          that.setDrawToOutput({
            layerIndex: that.LayerIndex,
            drawToOutput: this.checked
          });
        }
      }));
    }
  }),
  beforeMount: function beforeMount() {
    this.updateChecked();
  },

  watch: {
    Layer: {
      handler: function handler() {
        this.updateChecked();
      },

      deep: true
    }
  }
});

/***/ }),

/***/ 939:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'layerControls',
  data: function data() {
    return {
      clearingChecked: false,
      inheritChecked: false,
      pipelineChecked: false,
      drawToOutputChecked: false,
      inheritanceIndex: -1
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('layers', {
    Layer: 'focusedLayer',
    layers: 'allLayers',
    layerIndex: 'focusedLayerIndex'
  }), {
    name: function name() {
      if (!this.Layer) return '';
      if (!('name' in this.Layer)) return '';
      return this.Layer.name;
    },
    inheritedLayerName: function inheritedLayerName() {
      if (this.inheritanceIndex < 0) {
        return 'Last Layer';
      }

      return this.layers[this.inheritanceIndex || 0].name;
    }
  }),
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["d" /* mapMutations */])('layers', ['setClearing', 'setInherit', 'setInheritFrom', 'setPipeline', 'setDrawToOutput']), {
    updateChecked: function updateChecked() {
      var Layer = this.Layer;

      this.clearingChecked = Layer.clearing;
      this.inheritChecked = Layer.inherit;
      this.inheritanceIndex = Layer.inheritFrom;
      this.pipelineChecked = Layer.pipeline;
      this.drawToOutputChecked = Layer.drawToOutput;
    }
  }),
  watch: {
    Layer: {
      handler: function handler() {
        if (!this.Layer) return;
        this.updateChecked();
      },

      deep: true
    },
    clearingChecked: function clearingChecked() {
      this.setClearing({
        layerIndex: this.layerIndex,
        clearing: this.clearingChecked
      });
    },
    inheritChecked: function inheritChecked() {
      this.setInherit({
        layerIndex: this.layerIndex,
        inherit: this.inheritChecked
      });
    },
    inheritanceIndex: function inheritanceIndex() {
      this.setInheritFrom({
        layerIndex: this.layerIndex,
        inheritFrom: this.inheritanceIndex
      });
    },
    pipelineChecked: function pipelineChecked() {
      this.setPipeline({
        layerIndex: this.layerIndex,
        pipeline: this.pipelineChecked
      });
    },
    drawToOutputChecked: function drawToOutputChecked() {
      this.setDrawToOutput({
        layerIndex: this.layerIndex,
        drawToOutput: this.drawToOutputChecked
      });
    }
  },
  mounted: function mounted() {
    if (!this.Layer) return;

    this.updateChecked();
  }
});

/***/ }),

/***/ 940:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'addLayerButton',
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('layers', ['addLayer']))
});

/***/ }),

/***/ 941:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'removeLayerButton',
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('layers', ['removeFocusedLayer']))
});

/***/ }),

/***/ 942:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AddLayerButton__ = __webpack_require__(1692);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AddLayerButton___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__AddLayerButton__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__RemoveLayerButton__ = __webpack_require__(1693);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__RemoveLayerButton___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__RemoveLayerButton__);
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'layerMenu',
  components: {
    AddLayerButton: __WEBPACK_IMPORTED_MODULE_0__AddLayerButton___default.a,
    RemoveLayerButton: __WEBPACK_IMPORTED_MODULE_1__RemoveLayerButton___default.a
  }
});

/***/ }),

/***/ 943:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_toConsumableArray__ = __webpack_require__(578);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_toConsumableArray___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_toConsumableArray__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_Layer__ = __webpack_require__(1690);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_Layer___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__components_Layer__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vue_smooth_dnd__ = __webpack_require__(563);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vue_smooth_dnd___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_vue_smooth_dnd__);


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





var applyDrag = function applyDrag(arr, dragResult) {
  var removedIndex = dragResult.removedIndex,
      addedIndex = dragResult.addedIndex,
      payload = dragResult.payload;

  if (removedIndex === null && addedIndex === null) return arr;

  var result = [].concat(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_toConsumableArray___default()(arr));
  var itemToAdd = payload;

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;
};

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'list',
  components: {
    Draggable: __WEBPACK_IMPORTED_MODULE_4_vue_smooth_dnd__["Draggable"],
    Container: __WEBPACK_IMPORTED_MODULE_4_vue_smooth_dnd__["Container"],
    Layer: __WEBPACK_IMPORTED_MODULE_3__components_Layer___default.a
  },
  data: function data() {
    return {
      dragOptions: {
        group: {
          name: 'layers',
          pull: true,
          put: true
        },
        handle: '.handle',
        chosenClass: 'chosen'
      }
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["b" /* mapGetters */])('layers', {
    allLayers: 'allLayers',
    focusedLayer: 'focusedLayer'
  }), {
    layers: {
      get: function get() {
        return this.allLayers;
      },
      set: function set(value) {
        this.updateLayers({ layers: value });
      }
    }
  }),
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["c" /* mapActions */])('layers', ['addLayer']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["d" /* mapMutations */])('layers', ['updateLayers']), {
    onDrop: function onDrop(e) {
      this.layers = applyDrag(this.layers, e);
    }
  }),
  created: function created() {
    var _this = this;

    this.addLayer().then(function (_ref) {
      var Layer = _ref.Layer;

      _this.Layer = Layer;
    });
  }
});

/***/ }),

/***/ 944:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'outputWindowButton',
  data: function data() {
    return {
      msg: 'Welcome to Your Vue.js App'
    };
  },

  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('windows', ['createWindow']))
});

/***/ }),

/***/ 945:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_GlobalControls__ = __webpack_require__(754);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_GlobalControls___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_GlobalControls__);
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'side-menu',
  props: {
    menuState: {
      default: false
    }
  },
  components: {
    GlobalControls: __WEBPACK_IMPORTED_MODULE_0__components_GlobalControls___default.a
  }
});

/***/ }),

/***/ 946:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'statusBarItemProject',
  data: function data() {
    return {
      modalOpen: false
    };
  },

  methods: {
    useProject: function useProject(_ref) {
      var projectName = _ref.projectName;

      this.$store.dispatch('projects/setCurrent', { projectName: projectName });
    },
    isCurrent: function isCurrent(projectName) {
      return this.$store.state.projects.currentProject !== projectName;
    }
  }
});

/***/ }),

/***/ 947:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Project__ = __webpack_require__(1698);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Project___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__Project__);


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'statusBar',
  components: {
    projectItem: __WEBPACK_IMPORTED_MODULE_3__Project___default.a
  },
  data: function data() {
    return {
      sizeModalOpen: false,
      width: 0,
      height: 0
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["b" /* mapGetters */])('tempo', ['bpm', 'detect']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["b" /* mapGetters */])('layers', ['allLayers']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_vuex__["b" /* mapGetters */])('windows', ['largestWindowSize', 'largestWindowReference']), {
    activeModules: function activeModules() {
      return this.$store.state.modVModules.active;
    },
    sizeOut: function sizeOut() {
      return this.largestWindowSize.width + '\uD835\uDDD1' + this.largestWindowSize.height + 'px';
    },
    nonGalleryModules: function nonGalleryModules() {
      return __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_keys___default()(this.activeModules).filter(function (moduleName) {
        return moduleName.indexOf('-gallery') < 0;
      }).length;
    }
  }),
  methods: {
    setWindowSize: function setWindowSize() {
      this.resizeWindow(this.largestWindowReference(), this.width, this.height);
    },
    resizeWindow: function resizeWindow(window, width, height) {
      if (window.outerWidth) {
        window.resizeTo(width + (window.outerWidth - window.innerWidth), height + (window.outerHeight - window.innerHeight));
      } else {
        window.resizeTo(500, 500);
        window.resizeTo(width + (500 - document.body.offsetWidth), height + (500 - document.body.offsetHeight));
      }
    }
  },
  watch: {
    largestWindowSize: function largestWindowSize(value) {
      this.width = value.width;
      this.height = value.height;
    }
  }
});

/***/ }),

/***/ 948:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'tabs',
  props: ['titles'],
  data: function data() {
    return {
      focusedTabIndex: 1
    };
  },

  computed: {
    amount: function amount() {
      if (!this.titles) return 0;
      return this.titles.length;
    }
  },
  methods: {
    focusTab: function focusTab(tabIndex) {
      this.focusedTabIndex = tabIndex;
    }
  }
});

/***/ }),

/***/ 949:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__MenuItem__ = __webpack_require__(1703);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__MenuItem___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__MenuItem__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__is_descendant__ = __webpack_require__(1004);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'contextMenu',
  props: ['options'],
  data: function data() {
    return {
      offsetWidth: 0,
      offsetHeight: 0
    };
  },

  computed: {
    items: function items() {
      return this.options.items;
    },
    visible: function visible() {
      return this.options.visible;
    },
    isSubmenu: function isSubmenu() {
      return this.options.isSubmenu;
    },
    id: function id() {
      return this.options.$id;
    }
  },
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('contextMenu', ['popdownAll']), {
    checkIfClickedMenu: function checkIfClickedMenu(e) {
      e.preventDefault();
      if (!e.target === this.$refs.menu || !__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__is_descendant__["a" /* default */])(this.$refs.menu, e.target)) {
        this.popdownAll();
      }
    },
    reposition: function reposition() {
      var menuEl = this.$refs.menu;
      this.$data.offsetWidth = menuEl.offsetWidth;
      this.$data.offsetHeight = menuEl.offsetHeight;

      var setRight = false;

      var x = this.options.x;
      var y = this.options.y;

      var width = menuEl.clientWidth;
      var height = menuEl.clientHeight;

      if (x + width > window.innerWidth) {
        setRight = true;
        if (this.isSubmenu) {
          var node = this.parentMenu.node;
          x = node.offsetWidth + (window.innerWidth - node.offsetLeft - node.offsetWidth) - 2;
        } else {
          x = 0;
        }
      }

      if (y + height > window.innerHeight) {
        y = window.innerHeight - height;
      }

      if (!setRight) {
        menuEl.style.left = x + 'px';
        menuEl.style.right = 'auto';
      } else {
        menuEl.style.right = x + 'px';
        menuEl.style.left = 'auto';
      }

      menuEl.style.top = y + 'px';
    }
  }),
  beforeMount: function beforeMount() {
    if (!this.isSubmenu) {
      this.popdownAll([this.id]);
    }
  },
  mounted: function mounted() {
    this.reposition();

    window.addEventListener('click', this.checkIfClickedMenu);
  },
  updated: function updated() {
    this.reposition();
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('click', this.checkIfClickedMenu);
  },

  components: {
    contextMenuItem: __WEBPACK_IMPORTED_MODULE_2__MenuItem___default.a
  }
});

/***/ }),

/***/ 950:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Menu__ = __webpack_require__(1701);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Menu___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Menu__);

//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'contextMenuHandler',
  data: function data() {
    return {
      offsetWidth: 0,
      offsetHeight: 0
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('contextMenu', ['activeMenus'])),
  components: {
    contextMenu: __WEBPACK_IMPORTED_MODULE_2__Menu___default.a
  }
});

/***/ }),

/***/ 951:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'contextMenuItem',
  props: ['index', 'options', 'parentOptions', 'parentOffsetWidth', 'parentOffsetHeight', 'parentPosition'],
  data: function data() {
    return {
      modifiers: ''
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('contextMenu', ['realActiveMenus']), {
    type: function type() {
      return this.options.type;
    },
    label: function label() {
      return this.options.label;
    },
    enabled: function enabled() {
      return this.options.enabled;
    },
    submenu: function submenu() {
      return this.options.submenu;
    },
    tooltip: function tooltip() {
      return this.options.tooltip;
    },
    submenuActive: function submenuActive() {
      if (!this.submenu) return false;
      return this.realActiveMenus.indexOf(this.submenu.$id) > 0;
    },
    checked: function checked() {
      if (this.type !== 'checkbox') return false;
      return this.options.checked;
    },
    classes: function classes() {
      var classes = {};
      if (!this.enabled) classes.disabled = true;
      classes[this.type] = true;

      if (this.type === 'checkbox') {
        classes.checked = this.checked;
      }

      if (this.submenuActive) {
        classes['submenu-active'] = true;
      }

      return classes;
    }
  }),
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('contextMenu', ['popup', 'popdown', 'popdownAll']), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["d" /* mapMutations */])('contextMenu', ['editItemProperty']), {
    mouseover: function mouseover() {
      var _this = this;

      if (this.submenu) {
        var x = this.$refs.menuitem.offsetLeft;
        var y = this.$refs.menuitem.offsetTop + (this.parentPosition.y - 4);

        x = this.parentOffsetWidth + this.parentPosition.x;

        this.parentOptions.submenus.filter(function (menu) {
          return menu.$id !== _this.submenu.$id;
        }).forEach(function (menu) {
          return _this.popdown({ id: menu.$id });
        });

        this.popup({
          id: this.submenu.$id,
          x: x,
          y: y
        });
      } else {
        this.parentOptions.submenus.forEach(function (menu) {
          return _this.popdown({ id: menu.$id });
        });
      }
    },
    clicked: function clicked() {
      if (this.type === 'checkbox') {
        this.editItemProperty({
          id: this.parentOptions.$id,
          index: this.index,
          property: 'checked',
          value: !this.checked
        });
      }
      if (this.options.click) this.options.click();
      this.popdownAll();
    }
  }),
  beforeMount: function beforeMount() {
    if (this.submenu) {
      this.$data.modifiers = '▶︎';
    }
  },
  beforeDestroy: function beforeDestroy() {}
});

/***/ }),

/***/ 952:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ScopeItem__ = __webpack_require__(1705);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ScopeItem___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__ScopeItem__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'expression',
  props: [],
  data: function data() {
    return {
      expression: 'value'
    };
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('expression', {
    activeControlData: 'activeControlData',
    getAssignment: 'assignment'
  }), {
    moduleName: function moduleName() {
      return this.activeControlData.moduleName;
    },
    controlVariable: function controlVariable() {
      return this.activeControlData.controlVariable;
    },
    assignment: function assignment() {
      return this.getAssignment(this.moduleName, this.controlVariable) || false;
    },

    additionalScope: {
      get: function get() {
        if (!this.assignment) return {};
        return this.assignment.additionalScope;
      },
      set: function set(expression) {
        this.addExpression({
          expression: expression,
          moduleName: this.moduleName,
          controlVariable: this.controlVariable
        });
      }
    }
  }),
  created: function created() {
    this.expression = this.assignment.expression || 'value';
  },

  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["c" /* mapActions */])('expression', ['addExpression', 'addToScope', 'renameScopeItem', 'updateScopeItem']), {
    addNewScopeItem: function addNewScopeItem() {
      var scopeAdditions = {};
      scopeAdditions.newItem = 'function a(x) { return x * 2 }';
      this.addToScope({
        moduleName: this.moduleName,
        controlVariable: this.controlVariable,
        scopeAdditions: scopeAdditions
      });
    },
    updateScopeItemName: function updateScopeItemName(oldName, newName) {
      this.renameScopeItem({
        oldName: oldName,
        newName: newName,
        moduleName: this.moduleName,
        controlVariable: this.controlVariable
      });
    },
    updateScopeItemContents: function updateScopeItemContents(name, contents) {
      this.updateScopeItem({
        name: name,
        contents: contents,
        moduleName: this.moduleName,
        controlVariable: this.controlVariable
      });
    }
  }),
  components: {
    scopeItem: __WEBPACK_IMPORTED_MODULE_2__ScopeItem___default.a
  },
  watch: {
    expression: function expression(_expression) {
      this.addExpression({
        expression: _expression,
        moduleName: this.moduleName,
        controlVariable: this.controlVariable
      });
    }
  }
});

/***/ }),

/***/ 953:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(28);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'scope-item',
  props: ['contents', 'name'],
  data: function data() {
    return {
      editable: false,
      contentsInput: '',
      nameInput: ''
    };
  },

  computed: {},
  methods: {
    startEditable: function startEditable() {
      var _this = this;

      this.$data.editable = true;
      __WEBPACK_IMPORTED_MODULE_0_vue__["default"].nextTick(function () {
        _this.$refs.editableInput.focus();
      });
    },
    endEditable: function endEditable() {
      this.$data.editable = false;
      this.$emit('updateName', this.name, this.nameInput);
    }
  },
  beforeMount: function beforeMount() {
    this.$data.contentsInput = this.contents;
    this.$data.nameInput = this.name;
  },

  watch: {
    contentsInput: function contentsInput() {
      this.$emit('updateContents', this.name, this.contentsInput);
    },
    contents: function contents() {
      this.$data.contentsInput = this.contents;
    },
    name: function name() {
      this.$data.nameInput = this.name;
    }
  }
});

/***/ }),

/***/ 954:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'grabCanvasControlPanel',
  computed: {
    x: {
      get: function get() {
        return this.$store.state.grabCanvas.selectionX;
      },
      set: function set(value) {
        this.setSelection({
          selectionX: value
        });
      }
    },

    y: {
      get: function get() {
        return this.$store.state.grabCanvas.selectionY;
      },
      set: function set(value) {
        this.setSelection({
          selectionY: value
        });
      }
    },

    url: {
      get: function get() {
        return this.$store.state.grabCanvas.url;
      },
      set: function set(value) {
        this.setUrl({
          url: value
        });
      }
    },

    showCanvas: {
      get: function get() {
        return this.$store.state.grabCanvas.showCanvas;
      },
      set: function set(value) {
        this.setShowCanvas({
          showCanvas: value
        });
      }
    }
  },
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["d" /* mapMutations */])('grabCanvas', ['setSelection', 'setUrl', 'setShowCanvas']))
});

/***/ }),

/***/ 955:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lfo_types__ = __webpack_require__(598);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'expression',
  props: [],
  data: function data() {
    return {
      lfoTypes: [],
      expressionFunction: 'sine',
      frequency: 0.01,
      useBpm: true
    };
  },
  created: function created() {
    this.lfoTypes = this.lfoTypes.concat(__WEBPACK_IMPORTED_MODULE_2__lfo_types__["a" /* default */]);
    this.expressionFunction = this.assignment.waveform;
  },

  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('lfo', {
    activeControlData: 'activeControlData',
    getAssignment: 'assignment'
  }), {
    moduleName: function moduleName() {
      return this.activeControlData.moduleName;
    },
    controlVariable: function controlVariable() {
      return this.activeControlData.controlVariable;
    },
    assignment: function assignment() {
      var moduleName = this.moduleName,
          controlVariable = this.controlVariable;

      return this.getAssignment({ moduleName: moduleName, controlVariable: controlVariable });
    }
  }),
  methods: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["d" /* mapMutations */])('lfo', ['setLfoFunction', 'setLfoFrequency', 'setUseBpm'])),
  watch: {
    expressionFunction: function expressionFunction() {
      var moduleName = this.moduleName,
          controlVariable = this.controlVariable,
          expressionFunction = this.expressionFunction;

      this.setLfoFunction({ moduleName: moduleName, controlVariable: controlVariable, expressionFunction: expressionFunction });
    },
    frequency: function frequency() {
      var moduleName = this.moduleName,
          controlVariable = this.controlVariable,
          frequency = this.frequency;

      this.setLfoFrequency({ moduleName: moduleName, controlVariable: controlVariable, frequency: frequency });
    },
    useBpm: function useBpm() {
      var moduleName = this.moduleName,
          controlVariable = this.controlVariable,
          useBpm = this.useBpm;

      this.setUseBpm({ moduleName: moduleName, controlVariable: controlVariable, useBpm: useBpm });
    }
  }
});

/***/ }),

/***/ 956:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(11);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'midiAssignmentPluginControlPanel',
  computed: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_vuex__["b" /* mapGetters */])('midiAssignment', ['assignments', 'devices']))
});

/***/ }),

/***/ 957:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator__ = __webpack_require__(258);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator__ = __webpack_require__(257);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_promise__ = __webpack_require__(577);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_promise___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_promise__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__modv__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_axios__ = __webpack_require__(893);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_axios___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_axios__);



//
//
//
//
//
//
//
//
//
//
//
//
//




var appKey = 'rt8KwW';
var url = 'https://www.shadertoy.com/api/v1';

function getShaders(shaderIds) {
  var promises = [];

  shaderIds.forEach(function (id) {
    promises.push(__WEBPACK_IMPORTED_MODULE_4_axios___default.a.get(url + '/shaders/' + id, {
      params: {
        key: appKey
      }
    }));
  });

  return __WEBPACK_IMPORTED_MODULE_2_babel_runtime_core_js_promise___default.a.all(promises);
}

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'ShadertoyGallery',
  data: function data() {
    return {
      results: []
    };
  },

  methods: {
    search: function search(e) {
      var _this = this;

      return __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_asyncToGenerator___default()( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default.a.mark(function _callee() {
        return __WEBPACK_IMPORTED_MODULE_0_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                __WEBPACK_IMPORTED_MODULE_4_axios___default.a.get(url + '/shaders/query/' + e.target.value, {
                  params: {
                    key: appKey
                  }
                }).then(function (response) {
                  return getShaders(response.data.Results);
                }).then(function (shaders) {
                  _this.results = shaders.map(function (response) {
                    return response.data.Shader;
                  }).filter(function (shader) {
                    return shader.renderpass.length < 2;
                  });
                });

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }))();
    },
    makeModule: function makeModule(result) {
      var _result$renderpass$ = result.renderpass[0],
          code = _result$renderpass$.code,
          inputs = _result$renderpass$.inputs;

      var flipY = false;

      if (inputs.length) {
        flipY = inputs[0].sampler.vflip === 'true';
      }

      console.log(result, flipY);

      __WEBPACK_IMPORTED_MODULE_3__modv__["a" /* modV */].register({
        meta: {
          name: result.info.name,
          author: result.info.username,
          version: 0.1,
          uniforms: {},
          type: 'shader',
          previewWithOutput: true,
          flipY: flipY
        },
        fragmentShader: code
      });
    }
  }
});

/***/ }),

/***/ 958:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//

/**
 * The styles defined here are there to overwrite styles in the main application.
 * This is not the best idea, but something that can be done without hacking anything
 * into modV. A better way would be to add the styles directly in index.js.
 */
/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'slimUiControlPanel',
  methods: {}
});

/***/ })

},[149]);
//# sourceMappingURL=app.b3f221de50666872d3e3.js.map