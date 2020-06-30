const REPLACE_ALL_STR1_REGEXP = new RegExp(/([/,!\\^${}[\]().*+?|<>\-&])/g);
const REPLACE_ALL_STR2_REGEXP = new RegExp(/\$/g);

/**
 * http://dumpsite.com/forum/index.php?topic=4.msg8#msg8
 * @param {string} source
 * @param {string} str1
 * @param {string} str2
 * @param {boolean} ignoreCase
 * @return {string}
 */
function replaceAll(source, str1, str2, ignoreCase = false) {
  const str1ReplaceRegexpFlag = ignoreCase ? "gi" : "g";
  const regexp = new RegExp(
    str1.replace(REPLACE_ALL_STR1_REGEXP, "\\$&"),
    str1ReplaceRegexpFlag
  );
  const formattedStr2 =
    typeof str2 === "string"
      ? str2.replace(REPLACE_ALL_STR2_REGEXP, "$$$$")
      : str2;
  return source.replace(regexp, formattedStr2);
}

export default replaceAll;
