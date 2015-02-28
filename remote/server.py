import argparse
from collections import OrderedDict
import json
import pprint
import socket
import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import uuid

pp = pprint.PrettyPrinter(indent=2)
version = 1
registeredMods = OrderedDict()

remotes = {}
connections = {}
clients = {}

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("-p", "--port", nargs='?', const=8888, help = "sets the port number the WebSocket server runs on. Default 8888", type = int, default=8888)
	args = parser.parse_args()

	http_server = tornado.httpserver.HTTPServer(application)
	http_server.listen(args.port)
	tornado.ioloop.IOLoop.instance().start()

class WSHandler(tornado.websocket.WebSocketHandler):
	def check_origin(self, origin):
		return True

	# Handy method for JSON serialisation
	def sendJSON(self, type, data):
		self.write_message(json.dumps({'type': type, 'payload': data}))

	def open(self):
		print 'New connection'
		# Create UUID
		self.uuid = str(uuid.uuid4())
		# Store connection in dict for organisation later on
		connections[self.uuid] = self
		
		# Create announcement object and send
		hello = {'name': 'modV', 'version': version, 'id': self.uuid}
		self.sendJSON('hello', hello)

	def on_message(self, message):
		print 'Message received:'
		print(message)
		
		data = json.loads(message)
		if 'type' not in data:
			return False
		
		if 'payload' in data:
			pl = data['payload']
		
		if data['type'] == 'declare':
			print 'Declare call'
			print 'for a ' + pl['type'] + ' with id ' + pl['id']
			if pl['type'] == 'remote':
				remotes[pl['id']] = connections[pl['id']]
				for mod in registeredMods:
					remotes[pl['id']].sendJSON('register', registeredMods[mod])
			
			else:
				clients[pl['id']] = connections[pl['id']]
		
		elif data['type'] == 'register':
			print 'Register call'
			print 'mod name: ' + pl['name']
			
			for remote in remotes:
				connections[remote].sendJSON('register', pl)
			
			if pl['name'] not in registeredMods:
				registeredMods[pl['name']] = pl
				registerCallback = {'index': registeredMods[pl['name']]['order'], 'name': registeredMods[pl['name']]['name']}
				self.sendJSON('registerCB', registerCallback)

		elif data['type'] in ('ui', 'ui-opacity', 'ui-blend', 'ui-enabled'):
			
			if data['type'] == 'ui':
				# Store current data to push to new remotes when needed
				registeredMods[data['modName']]['controls'][data['index']]['currValue'] = data['payload']
			
			if data['type'] == 'ui-enabled':
				registeredMods[data['modName']]['enabled'] = data['payload']
			
			if data['type'] == 'ui-opacity':
				registeredMods[data['modName']]['alpha'] = data['payload']
			
			if data['type'] == 'ui-blend':
				registeredMods[data['modName']]['blend'] = data['payload']
			
			for remote in remotes:
				remotes[remote].write_message(json.dumps(data))
		
		else:
			
			if data['type'] == 'variable':
				# Store current data to push to new remotes when needed
				registeredMods[data['modName']]['controls'][data['index']]['currValue'] = data['payload']

			if data['type'] == 'check':
				registeredMods[data['modName']]['enabled'] = data['payload']

			if data['type'] == 'modOpacity':
				registeredMods[data['modName']]['alpha'] = data['payload']

			if data['type'] == 'modBlend':
				registeredMods[data['modName']]['blend'] = data['payload']
			
			for client in clients:
				connections[client].write_message(json.dumps(data))

	def on_close(self):
		print 'Connection closed'
		print 'Removing ID ' + self.uuid
		remotes.pop(self.uuid, None)
		clients.pop(self.uuid, None)
		connections.pop(self.uuid, None)

class MainHandler(tornado.web.RequestHandler):
	def get(self):
		self.render('index.html', ip=socket.gethostbyname(socket.gethostname()))


application = tornado.web.Application([
	(r'/ws', WSHandler),
#	(r'/(.*)', tornado.web.StaticFileHandler, {'path': './web/', 'default_filename': 'index.html'})
	(r'/(.*)', MainHandler)

#	(r'/(index\.html)', tornado.web.StaticFileHandler, {'path': './web/'})
])


if __name__ == "__main__":
	main()
