import {Queue} from 'bullmq'
import {redis} from './redis'

export const emailQueue = new Queue("email-queue" , {
    connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
  },
    defaultJobOptions:{
        attempts:3 ,
        backoff:{
            type:"exponential",
            delay:2000,
        },
        removeOnComplete:true,
        removeOnFail:false ,
    }
})