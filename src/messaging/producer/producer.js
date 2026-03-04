import kafka from "../../config/kafka.js";

const producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
  console.log("Kafka producer connected succesfully");
};


export const disconnectProducer = async () => {
  await producer.disconnect();
  console.log("Kafka producer disconnected succesfully");
};

export default producer