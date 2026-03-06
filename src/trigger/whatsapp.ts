import { task } from "@trigger.dev/sdk";

export const whatsappTask = task({
  id: "whatsapp-task",
  run: async (payload: any) => {
    console.log(payload);
  }
});
