export const getAcademicYearFromBatch = (batchYear, semester) => {
  const yearOffset = Math.floor((semester - 1) / 2);
  const startYear = batchYear + yearOffset;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
};