class Deduct{
    constructor(product){
        this.product = product;
    }
    urgency(){
        if(this.product.urgent == 'express'){
            return 0.02;
        }
        else{
            return 0.01;
        }
    }
    qty(){
        if(this.product.qty == 'few'){
            return 0.03;
        }
        else{
            return 0.01;
        }
    }
    size(){
        if(this.product.size == 'big'){
            return 0.02;
        }
        else{
            return 0.01;
        }
    }
    weight(){
        if(this.product.weight == 'heavy'){
            return 0.02;
        }
        else{
            return 0.01;
        }
    }
    fragile(){
        if(this.product.fragile == true)
            return 0.02;
        else
            return 0.01;
    }
    location(){
        if(this.product.location == 'kla')
            return 0.05;
        else
            return 0.02;
    }
    userLocation(){
        let delivery = 0;
        switch (this.product.user) {
            case 'keturah':
                delivery = 0.002
                break;
            case 'royal':
                delivery = 0.002
                break;
            case 'maisha':
                delivery = 0.0001
                break;
            case 'pioneer':
                delivery = 0.001
                break;
            case 'washington':
                delivery = 0.0015
                break;
            case 'st. peters':
                delivery = 0.002
                break;
            case 'pacuwa':
                delivery = 0.0025
                break;
            case 'northern elite':
                delivery = 0.001
                break;
            case 'jeremiah':
                delivery = 0.0015
                break;
            case 'hospital':
                delivery = 0.002
                break;
            case 'management':
                delivery = 0.0015
                break;
            case 'education':
                delivery = 0.002
                break;
            default:
                delivery = 0.001
                break;
        }
        return delivery;
    }
    get factorPrice(){
        
        return (this.product.price *
            (this.location()+this.fragile()+this.qty()+this.urgency()+this.size()+this.userLocation())
            );
    }
    index(){
        if(this.product.price >= 5000 && this.product.price <=20000){
            this.factorPrice * 0.9;
        }else if(this.product.price >= 20001 && this.product.price <=100000){
            this.factorPrice * 0.8;
        }else if(this.product.price >= 100001 && this.product.price <=250000){
            this.factorPrice * 0.7;
        }else if(this.product.price >= 250001 && this.product.price <=600000){
            this.factorPrice * 0.6;
        }else if(this.product.price >= 600001 && this.product.price <=1000000){
            this.factorPrice * 0.5;
        }else if(this.product.price >= 1000001 && this.product.price <=1500000){
            this.factorPrice * 0.4;
        }else if(this.product.price > 1500000){
            this.factorPrice * 0.4;
        }else{
            this.factorPrice * 1;

        }
        return this.factorPrice;
    }
    get total(){
        if(this.index() < 
            (0.1*this.product.price) && 
            this.product.price<25000 &&
            this.product.location == 'lira'
        ){
            return (0.05 * this.product.price)+this.index();
        }else{
            return this.index();

        }
    }

}
module.exports = Deduct;