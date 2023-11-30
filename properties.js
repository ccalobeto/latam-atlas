import { readFileSync } from 'node:fs'
import * as d3Dsv from 'd3-dsv';

const csv = readFileSync("build/dictionary.csv", { encoding: 'utf8' })
const dictionary = d3Dsv.csvParse(csv)

Promise.all([
  parseInput(),
  dictionary,
]).then(output);

function parseInput() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin
      .on("data", chunk => chunks.push(chunk))
      .on("end", () => {
        try { resolve(JSON.parse(chunks.join(""))); }
        catch (error) { reject(error); }
      })
      .setEncoding("utf8");
  });
}

function output([topology, dictionary]) {
  const keys = dictionary.columns
  const dlevel4 = new Map(dictionary.map(d => [d[keys[0]], d[keys[1]]]));
  const dlevel3 = new Map(dictionary.map(d => [d[keys[2]], d[keys[3]]]));
  const dlevel2 = new Map(dictionary.map(d => [d[keys[4]], d[keys[5]]]));
  for (const geometry of topology.objects.level4.geometries) {
    geometry.properties = {
      name: dlevel4.get(geometry.id)
    };
  }
  for (const geometry of topology.objects.level3.geometries) {
    geometry.properties = {
      name: dlevel3.get(geometry.id)
    };
  }
  for (const geometry of topology.objects.level2.geometries) {
    geometry.properties = {
      name: dlevel2.get(geometry.id)
    };
  }
  process.stdout.write(JSON.stringify(topology));
  process.stdout.write("\n");
}