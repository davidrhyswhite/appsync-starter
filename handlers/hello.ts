type Hello = {
  __typename: string;
  say: string;
};

export function handler(event: any, context: any, callback: any): Hello {
  return callback(null, {
    __typename: "Hello",
    say: "Hello Lambda!"
  });
}
