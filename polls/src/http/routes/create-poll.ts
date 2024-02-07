import {z} from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"


export async function createPoll(app: FastifyInstance) {
    app.post("/polls", async (request, reply)=>{
        //define structure of body
        const createPollBody = z.object({ 
            title: z.string(),
            options: z.array(z.string())
        })
    
        //destructure body
        const {title, options} = createPollBody.parse(request.body)
    
        //insert db
        const poll = await prisma.poll.create({
            data: {
                title,                
                options: {
                    createMany: {
                        data: options.map(option =>{
                            return { title: option }
                        })              
                    }
                }
            }
        })
    
        return reply.status(201).send({pollId: poll.id})
    })
    
}

/*START CONTAINERS
    docker compose up -d
    docker ps - views active containers 

*/