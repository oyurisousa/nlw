import {z} from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"


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
    
        return reply.send({poll})
    })
    
}

/*START CONTAINERS
    docker compose up -d
    docker ps - views active containers 

*/