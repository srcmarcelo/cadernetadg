export const getMaxId = (arr, index) => {
  const splited_first_id = arr[0].id.split('_');
  let max = splited_first_id[index || 1];
  arr.forEach((item) => {
    const splited_id = item.id.split('_');
    if (parseInt(splited_id[index || 1]) > max) max = parseInt(splited_id[index || 1]);
  });
  return parseInt(max);
};
