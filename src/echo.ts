import HTTPError from 'http-errors';

function echo(value: string) {
  if (value === 'echo') {
    // NEW Iteration 3
    throw HTTPError(400, 'Cannot echo "echo"');
    // OLD Iteration 2
    // return { error: 'You cannot echo the word echo itself' };
  }
  return value;
}

export { echo };

