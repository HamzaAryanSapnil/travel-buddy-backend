"use strict";
/**
 * Chat Service Tests
 *
 * Note: These are test stubs. Install Jest (@types/jest) and configure it to run these tests.
 *
 * Required tests (minimal set):
 * 1. Permission: non-member cannot send message → 403
 * 2. Send message creates Message with correct fields → persisted
 * 3. Get messages returns items sorted DESC & nextCursor works
 * 4. Edit message restricted after 15 minutes → returns 403
 * 5. Delete message sets isDeleted=true and content masked
 */
// @ts-nocheck - Test file, requires Jest types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _testStubs = {
    describe: (name, fn) => { },
    it: (name, fn) => { }
};
// Uncomment when Jest is configured:
/*
describe("ChatService", () => {
  describe("sendMessage", () => {
    it("should throw 403 when non-member tries to send message", async () => {
      // TODO: Implement test
      // - Create a thread
      // - Try to send message as non-member
      // - Expect ApiError with 403 status
    });

    it("should create message with correct fields", async () => {
      // TODO: Implement test
      // - Create thread and add member
      // - Send message
      // - Verify message persisted with correct content, senderId, threadId
    });
  });

  describe("getMessages", () => {
    it("should return messages sorted DESC with nextCursor", async () => {
      // TODO: Implement test
      // - Create thread and send multiple messages
      // - Get messages
      // - Verify order is DESC by createdAt
      // - Verify nextCursor is set correctly when more messages exist
    });
  });

  describe("editMessage", () => {
    it("should throw 403 when editing after 15 minutes", async () => {
      // TODO: Implement test
      // - Create and send message
      // - Mock time to be > 15 minutes later
      // - Try to edit
      // - Expect ApiError with 403 status
    });
  });

  describe("deleteMessage", () => {
    it("should soft delete message (set isDeleted=true and mask content)", async () => {
      // TODO: Implement test
      // - Create and send message
      // - Delete message
      // - Verify isDeleted=true and content="[deleted]"
    });
  });
});
*/
