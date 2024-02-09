import {record, z} from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"
import { redis } from "../../lib/redis"
import { Result } from "ioredis"


export async function getPoll(app: FastifyInstance) {
    app.get("/polls/:pollId", async (request, reply)=>{
        //define structure of body
        const createPollParams = z.object({ 
            pollId: z.string().uuid(),
        })
    
        //destructure body
        const {pollId} = createPollParams.parse(request.params)
    
        //insert db
        const poll = await prisma.poll.findUnique({
            where: {
                id: pollId
            },
            include: {
                options: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
            
        })
        if(!poll){
            return reply.status(400).send({message: "Poll not found!"})
        }
        const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES')
        
        const votes = result.reduce((obj,line, index )=>{
            if(index % 2 === 0){
                const score = result[index+1] 
                Object.assign(obj, {[line]: Number(score)})
            }
            return obj
        }, {} as Record<string,number>)

       
        return reply.send({
            poll: {
                id: pollId,
                title: poll.title,
                options: poll.options.map(option =>{
                    return {
                        id: option.id,
                        title: option.title,
                        score: (votes[option.id]) ? votes[option.id] : 0
                    }
                })
            }
        })
    })
    
}

/*START CONTAINERS
    docker compose up -d
    docker ps - views active containers 

*/