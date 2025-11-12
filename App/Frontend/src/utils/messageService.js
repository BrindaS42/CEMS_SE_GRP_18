export const messageService = {
  getUnreadCount: async () => {
    // Mock implementation - returns a random count
    return Promise.resolve({
      data: {
        count: Math.floor(Math.random() * 10),
      },
    });
  },
};