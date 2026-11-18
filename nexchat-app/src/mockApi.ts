// src/mockApi.ts
export const mockRegister = async (username: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
  return { userid: "mock-user-123", recovery_code: "ABCD-1234-EFGH-5678" };
};

export const mockLogin = async (username: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { userid: "mock-user-123" };
};