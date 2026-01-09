import {Queue} from 'bullmq'
import {redis} from './redis'

export const emailQueue = new Queue("email-queue" , {
    connection: {
    // match BullMQ's expected ConnectionOptions
    host: "thankful-man-23367.upstash.io",
    port: 6379,
    password: "AVtHAAIncDIzMzIxYjIyMmU0NGM0MTdiYmEzZTVjMjRhMzNiYWI4N3AyMjMzNjc",
    tls: {} // required for rediss://
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