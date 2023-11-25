import {NlpManager} from 'node-nlp';

async function trainModel(){
    // nlp manager
    const manager = new NlpManager({languages:['en'], forceNER:true});

    // train the model on different time questions
    manager.addDocument('en','What time is it?','time.check');
    manager.addDocument('en','can you tell me the current time?','time.check');
    manager.addDocument('en','What\'s the time','time.check');
    manager.addDocument('en','yo bruv, what time is it?','time.check');
    manager.addDocument('en','tell me the time','time.check');
    manager.addDocument('en', 'catcha later', 'greetings.bye');
    manager.addDocument('en', 'bye bye bye', 'greetings.bye');
    manager.addDocument('en', 'see ya', 'greetings.bye');
    manager.addDocument('en', 'bye for now', 'greetings.bye');
    manager.addDocument('en', 'goodbye', 'greetings.bye');
    manager.addDocument('en', 'heyy', 'greetings.bye');
    manager.addDocument('en', 'hello', 'greetings.hello');
    manager.addDocument('en', 'hi', 'greetings.hello');
    manager.addDocument('en', 'aloha', 'greetings.hello');

    // train and save the model
    await manager.train();
    manager.save();

    return manager;
}

function getCurrentTime(){
    const now = new Date();
    return now.toLocaleTimeString('en-US',{hour:'numeric', minute:'numeric', hour12:true});
}







async function getResponse(manager, query){
    const response = await manager.process('en', query);
    if (response.intent === 'time.check'){
        return `the current time is ${getCurrentTime()}`;
    } else if (response.intent === 'greetings.hello'){
        return `heyyyyyyy`;
    } else if (response.intent === 'greetings.bye'){
        return `byeeeeee`;
    }
    else {
        return "i have no idea what you're talking about dude";
    }
}

async function main(){
    const manager = await trainModel();
    const userQuery = "tell me the time dude";
    const response = await getResponse(manager, userQuery);
    console.log(response);
}

main(); 