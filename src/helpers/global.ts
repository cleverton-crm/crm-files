export function getBoolean(val) {
  return val; // !!JSON.parse(String(val).toLowerCase());
}

export const ResponseSuccessData = (message: string) => {
  return {
    statusCode: 200,
    message: message,
    status: true,
  };
};
