// On se connecte au serveur socket
const socket = io();

socket.on("connect", () => {
    socket.emit("enter_room", "general");
});


window.onload = () => {
    document.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.querySelector("#name")
        const message = document.querySelector("#message");
        const room = document.querySelector("#tabs li.active").dataset.room;
        const createdAt = new Date();

        socket.emit("chat_message", {
            name: name.value,
            message: message.value,
            room: room,
            createdAt: createdAt
        });

        document.querySelector("#message").value = "";
    });

    socket.on("received_message", (msg) => {
        publishMessages(msg);
    })

    document.querySelectorAll("#tabs li").forEach((tab) => {
        tab.addEventListener("click", function(){
            if(!this.classList.contains("active")){
                const actif = document.querySelector("#tabs li.active");
                actif.classList.remove("active");
                this.classList.add("active");
                document.querySelector("#messages").innerHTML = "";
                socket.emit("leave_room", actif.dataset.room);
                socket.emit("enter_room", this.dataset.room);
            }
        })
    });

    socket.on("init_messages", msg => {
        let data = JSON.parse(msg.messages);
        if(data != []){
            data.forEach(donnees => {
                publishMessages(donnees);
            })
        }
    });

    document.querySelector("#message").addEventListener("input", () => {
        const name = document.querySelector("#name").value;
        const room = document.querySelector("#tabs li.active").dataset.room;

        socket.emit("typing", {
            name: name,
            room: room
        });
    });

    socket.on("usertyping", msg => {
        const writing = document.querySelector("#writing");

        writing.innerHTML = `${msg.name} tape un message...`;

        setTimeout(function(){
            writing.innerHTML = "";
        }, 5000);
    });
}

function publishMessages(msg){
    let created = new Date(msg.createdAt);
    let texte = `<div id="msgContainer"><p id="username">${msg.name}</p><p id="contentMsg">${msg.message}</p><small id="date">${created.toLocaleDateString()}</small></div>`

    document.querySelector("#messages").innerHTML += texte;
}