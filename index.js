const io = require("socket.io")(8800, {
    cors: {
        origin: "http://localhost:5173"
    }
})

let activeUsers = []

io.on("connection", (socket)=>{
    //add new user
    socket.on('new-user-add', (newUserId)=>{
        //if user is not addedd previuosly
        if(!activeUsers.some((user)=> user.userId === newUserId)){
            activeUsers.push({
                userId: newUserId,
                socketId: socket.id
            })

            console.log("Connected Users", activeUsers)
        }
        
        io.emit('get-users', activeUsers)
    })


    socket.on("disconnect", ()=>{
        activeUsers = activeUsers.filter((user)=> user.socketId !== socket.id)
        console.log("User Disconnected", activeUsers)
        io.emit('get-users', activeUsers)
    })

    //Send message
    socket.on('send-message', (data)=>{
        const {receiverId} = data
        console.log(data)
        const user = activeUsers.find((user)=>user.userId === receiverId)
        console.log("Sending from socket to : ", receiverId)
        if(user){
            io.to(user.socketId).emit('receive-message', data)
        }
    })

    //Create a post
    socket.on('friend-request', (data)=>{
        const {id} = data
        const user = activeUsers.find((user)=>user.userId === id)
        console.log(data)
        if(user){
            io.to(user.socketId).emit('new-request', data)
        }
    })

})