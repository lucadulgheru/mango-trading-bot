class ObjectMapper{
    public static instance: ObjectMapper;

    private constructor(){}

    public static getInstance(): ObjectMapper{
        if(!ObjectMapper.instance){
            ObjectMapper.instance = new ObjectMapper();
        }
        return ObjectMapper.instance;
    }

    // TODO complete here
    public priceResponseToObject(){

    }

    // TODO complete here
    public ohlcResponseToObject(){

    }
}