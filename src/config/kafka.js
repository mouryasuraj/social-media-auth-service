import {Kafka} from 'kafkajs'
import { env } from './env.js'

const kafka = new Kafka({
    clientId:"auth-service",
    brokers:[env.KAFKA_BROKER || "localhost:9092"],
    retry:{
        initialRetryTime:500,
        retries:10
    }
})

export default kafka