const express = require('express');
const app = express();
const session = require ('express-session');
const path = require('path');
const pg = require('pg');
const bcrypt = require('bcrypt');

const pool = new pg.Pool({
    user:'me',
    host:'localhost',
    database:'sprint2Sem3',
    password:'password',
    port:5432
})

app.use(session({secret:"Shartatron"}))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));

app.get("/", function(req, res){
    res.send("Welcome to my Homepage")
})

app.get('/signup', function(req, res){
   
    res.sendFile(path.join(__dirname, 'signup.html'))
})

app.post('/signup', async function(req, res){
    let email = req.body.email;
    let password = req.body.password;
    let routevalue = req.body.roles
   
    let encrypted_password = await bcrypt.hash(password, 10);
    let results =await pool.query('SELECT * FROM users WHERE email=$1', [email])
    if(results.rows.length > 0){
        res.send("Error, Theere is another account with that email")
    }else{
        let insert_result = pool.query('INSERT INTO users(email, password, routevalue) VALUES ($1, $2, $3)', [email, encrypted_password, routevalue])
        res.send("Created account!")
    }
})

app.get("/signin", function(req, res){
    res.sendFile(path.join(__dirname, 'signin.html'))
})

app.post("/signin", async function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    
   let results = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
   
   if(results.rows < 1){
       res.send("Account not found")
   }else if(results.rows> 1 ){
       console.warn("There are two accounts with the same email")
       res.send("ohh no, there are mulitiple accounts under that email!!")
    }else{
        if(await bcrypt.compare(password,results.rows[0].password)){

            req.session.loggedin = true;
            res.send("Congrats, you loggedin!")  
        }else{
            res.send ("Invalid Password, please try again!!")
        }
    }
})

app.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});

app.get("/secret", function(req, res){
    if(req.session.loggedin === true){
        res.send("Hey you can see the secret. Do the DEW!!")
    }else{
        res.send(("No good! You have to be logged in!"))
    }
})

app.get("/customer", function(req, res){
 
    if(req.session.loggedin === true ){
        res.send(atree);
    }else{
        res.send(("No good! You have to be logged in!"))
    }
});

app.get("/admin", function(req, res){
    if(req.session.loggedin === true){
        res.send(atreec);
    }else{
        res.send(("No good! You have to be logged in!"))
    }
    
});
app.get("/superuser", function(req, res){
    if(req.session.loggedin === true ){
        res.send(atreeb);
    }else{
        res.send(("No good! You have to be logged in!"))
    }
    
});

app.listen(3000, function(){
    console.log("listening at http://localhost:3000")
})
//---------------------------------------------------------------

//AVLTree question 3
const Compare = {
    LESS_THAN: -1,
    BIGGER_THAN: 1,
    EQUALS: 0
  };
  
function defaultCompare(a, b) {
    if (a === b) {
      return Compare.EQUALS;
    }
    return a < b ? Compare.LESS_THAN : Compare.BIGGER_THAN;
  }
  
class Node {
    constructor(key) {
      this.key = key;
      this.left = undefined;
      this.right = undefined;
    }
}
class BinarySearchTree {
    constructor(compareFn = defaultCompare) {
      this.compareFn = compareFn;
      this.root = undefined;
    }
    
    getRoot() {
      return this.root;
    }
    search(key) {
      return this.searchNode(this.root, key);
    }
    searchNode(node, data) {
      if (node == null) {
        return false;
      }
      if (this.compareFn(data, node.data) === Compare.LESS_THAN) {
        return this.searchNode(node.left, data);
      } else if (this.compareFn(data, node.key) === Compare.BIGGER_THAN) {
        return this.searchNode(node.right, data);
      }
      return true;
    }
    inOrderTraverse(callback) {
      this.inOrderTraverseNode(this.root, callback);
    }
    inOrderTraverseNode(node, callback) {
      if (node != null) {
        this.inOrderTraverseNode(node.left, callback);
        callback(node.key);
        this.inOrderTraverseNode(node.right, callback);
      }
    }
    preOrderTraverse(callback) {
      this.preOrderTraverseNode(this.root, callback);
    }
    preOrderTraverseNode(node, callback) {
      if (node != null) {
        callback(node.key);
        this.preOrderTraverseNode(node.left, callback);
        this.preOrderTraverseNode(node.right, callback);
      }
    }
    postOrderTraverse(callback) {
      this.postOrderTraverseNode(this.root, callback);
    }
    postOrderTraverseNode(node, callback) {
      if (node != null) {
        this.postOrderTraverseNode(node.left, callback);
        this.postOrderTraverseNode(node.right, callback);
        callback(node.key);
      }
    }
    min() {
      return this.minNode(this.root);
    }
    minNode(node) {
      let current = node;
      while (current != null && current.left != null) {
        current = current.left;
      }
      return current;
    }
    max() {
      return this.maxNode(this.root);
    }
    maxNode(node) {
      let current = node;
      while (current != null && current.right != null) {
        current = current.right;
      }
      return current;
    }

  }
  
const BalanceFactor = {
  UNBALANCED_RIGHT: 1,
  SLIGHTLY_UNBALANCED_RIGHT: 2,
  BALANCED: 3,
  SLIGHTLY_UNBALANCED_LEFT: 4,
  UNBALANCED_LEFT: 5
};

class AVLTree extends BinarySearchTree {
  constructor(compareFn = defaultCompare) {
    super(compareFn);
    this.compareFn = compareFn;
    this.root = null;
  }
  getNodeHeight(node) {
    if (node == null) {
      return -1;
    }
    return Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right)) + 1;
  }
  
  rotationLL(node) {
    const tmp = node.left;
    node.left = tmp.right;
    tmp.right = node;
    return tmp;
  }
  rotationRR(node) {
    const tmp = node.right;
    node.right = tmp.left;
    tmp.left = node;
    return tmp;
  }

  rotationLR(node) {
    node.left = this.rotationRR(node.left);
    return this.rotationLL(node);
  }

  rotationRL(node) {
    node.right = this.rotationLL(node.right);
    return this.rotationRR(node);
  }
  getBalanceFactor(node) {
    const heightDifference = this.getNodeHeight(node.left) - this.getNodeHeight(node.right);
    switch (heightDifference) {
      case -2:
        return BalanceFactor.UNBALANCED_RIGHT;
      case -1:
        return BalanceFactor.SLIGHTLY_UNBALANCED_RIGHT;
      case 1:
        return BalanceFactor.SLIGHTLY_UNBALANCED_LEFT;
      case 2:
        return BalanceFactor.UNBALANCED_LEFT;
      default:
        return BalanceFactor.BALANCED;
    }
  }
  insert(key) {
    this.root = this.insertNode(this.root, key);
  }
  insertNode(node, data) {
    if (node == null) {
      return new Node(data);
    } else if (this.compareFn(data, node.data) === Compare.LESS_THAN) {
      node.left = this.insertNode(node.left, data);
    } else if (this.compareFn(data, node.data) === Compare.BIGGER_THAN) {
      node.right = this.insertNode(node.right, data);
    } else {
      return node; 
    }
    // verify if tree is balanced
    const balanceFactor = this.getBalanceFactor(node);
    if (balanceFactor === BalanceFactor.UNBALANCED_LEFT) {
      if (this.compareFn(key, node.left.key) === Compare.LESS_THAN) {
        // Left left case
        node = this.rotationLL(node);
      } else {
        // Left right case
        return this.rotationLR(node);
      }
    }
    if (balanceFactor === BalanceFactor.UNBALANCED_RIGHT) {
      if (this.compareFn(data, node.right.data) === Compare.BIGGER_THAN) {
        // Right right case
        node = this.rotationRR(node);
      } else {
        // Right left case
        return this.rotationRL(node);
      }
    }
    return node;
  }
  removeNode(node, data) {
    node = super.removeNode(node, data); 
    if (node == null) {
      return node;
    }
    // verify if tree is balanced
    const balanceFactor = this.getBalanceFactor(node);
    if (balanceFactor === BalanceFactor.UNBALANCED_LEFT) {
      // Left left case
      if (
        this.getBalanceFactor(node.left) === BalanceFactor.BALANCED ||
        this.getBalanceFactor(node.left) === BalanceFactor.SLIGHTLY_UNBALANCED_LEFT
      ) {
        return this.rotationLL(node);
      }
      // Left right case
      if (this.getBalanceFactor(node.left) === BalanceFactor.SLIGHTLY_UNBALANCED_RIGHT) {
        return this.rotationLR(node.left);
      }
    }
    if (balanceFactor === BalanceFactor.UNBALANCED_RIGHT) {
      // Right right case
      if (
        this.getBalanceFactor(node.right) === BalanceFactor.BALANCED ||
        this.getBalanceFactor(node.right) === BalanceFactor.SLIGHTLY_UNBALANCED_RIGHT
      ) {
        return this.rotationRR(node);
      }
      // Right left case
      if (this.getBalanceFactor(node.right) === BalanceFactor.SLIGHTLY_UNBALANCED_LEFT) {
        return this.rotationRL(node.right);
      }
    }
    return node;
  }
}


  

let atree = new AVLTree();
let atreeb = new AVLTree();
let atreec = new AVLTree();


const datapoola = new Promise(function (resolve, reject){
    return pool.query(`SELECT * FROM public."Roles_and_their_Routes" WHERE role_name='Customer'`, function(err, result){
        if(err)reject(err);
        resolve(result);
    });
});
const updatedatree = async(dataP)=>{
    let data = await dataP;
    for (let i = 0; i < data.rowCount;i++){
        let arr =(Object.values(data.rows[i]));
        atree.insert(arr[1]); 
    }
     console.log(atree)
}

const datapoolb = new Promise(function (resolve, reject){
    return pool.query(`SELECT * FROM public."Roles_and_their_Routes" WHERE role_name='Super User'`, function(err, result){
        if(err)reject(err);
        resolve(result);
    });
});
const updatedatreeB = async(dataP)=>{
    let data = await dataP;
    for (let i = 0; i < data.rowCount;i++){
        let arr =(Object.values(data.rows[i]));
        atreeb.insert(arr[1]); 
    }
     console.log(atreeb)
}

const datapoolc = new Promise(function (resolve, reject){
    return pool.query(`SELECT * FROM public."Roles_and_their_Routes" WHERE role_name='Administrator'`, function(err, result){
        if(err)reject(err);
        resolve(result);
    });
});
const updatedatreeC = async(dataP)=>{
    let data = await dataP;
    for (let i = 0; i < data.rowCount;i++){
        let arr =(Object.values(data.rows[i]));
        atreec.insert(arr[1]); 
    }
     console.log(atreec)
}
updatedatree(datapoola)
updatedatreeB(datapoolb)
updatedatreeC(datapoolc)






