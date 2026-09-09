import results from "./extractions/results.json";

// Raw files are the unedited outputs of the isolated runs recorded in results.json.
export const extractionResults = [
  results.outputs.htomd,
  results.outputs.trafilatura,
  results.outputs.html2text,
];

export const otherExtractions = Object.values(results.outputs).filter(
  (result) => !result.displayed,
);
