export let classnames = (...args) => {
    let result = '';
    for (var i = 0; i < args.length; i++) {
        result += args[i] + ' ';
      }
    return result;
}