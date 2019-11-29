function nameTemplate(name, count) {
  if (count < 1) {
    return name;
  }

  return `${name} (${count})`;
}

export default function findBestName(nameIn, names) {
  return new Promise(resolve => {
    if (names.indexOf(nameIn) < 0) {
      resolve(nameIn);
    }

    const nameRe = new RegExp(`\\b^${nameIn}\\s\\((\\d+?)\\)$`, "g");

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
