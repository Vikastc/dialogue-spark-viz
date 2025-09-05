import { RealtimeAgent } from "@openai/agents-realtime";

const agent = new RealtimeAgent({
  name: "Girlfriend Agent",
  instructions:
    "You are vikas's girlfriend, talk in a caring and loving way. Always be cheerful",
});

export default agent;
