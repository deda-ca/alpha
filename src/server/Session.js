
class Session
{
    constructor(engine)
    {
        this.engine = engine;

        this.users = new Set();
    }

    /**
     * Lets the given user join this session.
     * @param {User} user 
     */
    join(user)
    {
        // Add the given user to the session.
        this.users.add(user);

        user.join(this);
    }

    /**
     * 
     * @param {*} user 
     */
    leave(user)
    {
        this.users.delete(user);
        
        user.leave(this);
    }


    updateClients()
    {
    
        const updates = JSON.stringify(serializeMap());
    
        // Traverse all clients and update them.
        for (let webSocket of clients)
            webSocket.send(updates);
    }


    serialize()
    {
        // Traverse the users and serialize their state.
        const users = [];
        for (let user of this.users) users.push(user.serialize());

        const data = {
            type: 'session',
            users
        };
    
        return data;
    }


    queue(update)
    {
        const data = (update ? {'type': 'update', updates: [update]} : this.serialize());

        const json = JSON.stringify(data);

        console.log(data);

        // Send the data to the user session users.
        for (let user of this.users) user.send(json);
    }

}

module.exports = Session;