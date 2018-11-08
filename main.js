const axios = require('axios')
const baseURL = 'https://ajax-blog-dmkite.herokuapp.com'

document.addEventListener('DOMContentLoaded', getAll)


///////////////////////////////////////////////////////////////////////////////
//          GET ALL
///////////////////////////////////////////////////////////////////////////////
function getAll() {
    axios.get(`${baseURL}/posts`)
        .then(result => {
            let arr = result.data.data
            addList(arr)
            let posts = document.querySelectorAll('#entries a')
            posts.forEach(post => post.addEventListener('click', function (e) { getOne(e) }))
        })
}

function addList(arr) {
    let postHTML = []
    arr.forEach(post => postHTML.push(liTemplate(post)))
    const entryList = document.querySelector('#entries')
    entryList.innerHTML = postHTML.join('')
}

function liTemplate(post) {
    if (post.title.length > 30) title = post.title.slice(0, 30) + '...'
    return `<li><a href="#" id=${post.id}>${title || post.title}</a></li>`
}

///////////////////////////////////////////////////////////////////////////////
//          GET ONE
//////////////////////////////////////////////////////////////////////////////
function getOne(e) {
    let id = e.target.id
    axios.get(`${baseURL}/posts/${id}`)
        .then(result => {
            return result.data
        })
        .then(result => {
            result.htmlString = `<div class="htmlPost" id="${result.data.id}  ">
                                        <h3>${result.data.title}</h3>
                                        <p>${result.data.content}</p>
                                        <button id="edit">edit</button>
                                        <button id="delete">delete</button>
                                    </div>`

            return result
        })
        .then(result => {
            document.querySelector('#contentHolder').innerHTML = result.htmlString
            document.querySelector('#edit').addEventListener('click', editOne)
            document.querySelector('#delete').addEventListener('click', deleteOne)
        })
}

///////////////////////////////////////////////////////////////////////////////
//          CREATE ONE
///////////////////////////////////////////////////////////////////////////////
document.querySelector('#add').addEventListener('click', setUpInput)

function setUpInput(){
    document.querySelector('#contentHolder').innerHTML = ` 
    <form id="form">
        <input type="text" id="title">
        <textarea name="textInput" id="textarea"></textarea>
        <button id="submit" type="submit">submit</button>
    </form>`
    document.querySelector('#submit').addEventListener('click', function(e){setUpSubmit(e)})
}

function setUpSubmit(e, str = 'submitted'){
    const submit = document.querySelector('#submit')
    setTimeout(function(){
        submit.classList.add('thinking')
        submit.textContent = ''
        setTimeout(function(){
            submit.classList.add('done')
            submit.textContent = str
        }, 1500)
    }, 0)
}

document.querySelector('#form').addEventListener('submit', submitVal)

function submitVal(e){
    e.preventDefault()
    const valid = validate()
    if(!valid) return false
    let newPost = createPost()
    return createOne(newPost)
}

function validate(){
    const input = document.querySelector('#title')
    const textarea = document.querySelector('#textarea') 
    console.log(input, textarea)   
    if(input.value === '' || textarea.textContent === ''){
        alert('Submissions require a body and a title')
        return false
    }
    return true
}

function createPost(){
    let newPost = {}
    const input = document.querySelector('#input')
    const textarea = document.querySelector('#textarea') 
    newPost.title = input.textContent
    newPost.content = textarea.textContent
    return newPost
}

function createOne(body){
    axios.post(`${baseURL}/posts`, body)
        .then(result =>{
            console.log(result)
        })
}

///////////////////////////////////////////////////////////////////////////////
//          EDIT ONE
///////////////////////////////////////////////////////////////////////////////
function editOne(e) {
    e.preventDefault()
    let form = document.querySelector('#form')
    let newPostObj = { id: form.children[0].id, title: form.children[1].value, content: form.children[3].textContent }
    cueEditButton()

    axios.patch(`${baseURL}/posts/${newPostObj.id}`, newPostObj)
        .then(result => {
            /////////////////////Weird bug with titles//////////////////////////////////////
            getAll()
        })

}

function cueEditButton() {
    prepareForEdit()
    document.querySelector('#submit').addEventListener('click', function (e) { submitEdit(e) })
}

function prepareForEdit() {
    let htmlPost = document.querySelector('.htmlPost')
    let editObj = { id: htmlPost.id, postTitle: htmlPost.children[0].textContent, postBody: htmlPost.children[1].textContent }
    enterEditMode(editObj)
}

function enterEditMode(obj) {
    document.querySelector('#contentHolder').innerHTML =
        `<form id="form">
        <label for="title" id="${obj.id}">Title</label>
        <input type="text" id="title" value="${obj.postTitle}">
        <label for="textarea">Post</label>
        <textarea name="textInput" id="textarea">${obj.postBody}</textarea>
        <button id="submit" type="submit">submit</button>
    </form>`
}

///////////////////////////////////////////////////////////////////////////////
//          DELETE ONE
///////////////////////////////////////////////////////////////////////////////


function deleteOne() {

}


module.exports = { getAll }
