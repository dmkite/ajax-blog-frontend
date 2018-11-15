const axios = require('axios')
const baseURL = 'https://ajax-blog-dmkite.herokuapp.com'

document.addEventListener('DOMContentLoaded', initialSetUp)

// This is a good pattern
function initialSetUp(){
    getAll()
    setUpInput()
}

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
    const postHTML = []
    arr.forEach(post => postHTML.push(liTemplate(post)))
    const entryList = document.querySelector('#entries')
    entryList.innerHTML = postHTML.join('')
}

function liTemplate(post) {
    let minTitle
    if (post.title.length > 30) minTitle = post.title.slice(0, 30) + '...'
    return `<li><a href="#" id=${post.id}>${minTitle || post.title}</a></li>`
}

///////////////////////////////////////////////////////////////////////////////
//          GET ONE
//////////////////////////////////////////////////////////////////////////////
function getOne(e, pid) {
    let id
    if(!pid){
        id = e.target.id
    }
    else id = pid
    axios.get(`${baseURL}/posts/${id}`)
        .then(result => {
            return result.data
        })
        .then(result => {
            result.htmlString = `<div class="htmlPost" id="${result.data.id}  ">
                                        <h3>${result.data.title}</h3>
                                        <p>${result.data.content}</p>
                                        <button id="delete">delete</button>
                                        <button id="edit">edit</button>
                                    </div>`

            return result
        })
        .then(result => {
            document.querySelector('#contentHolder').innerHTML = result.htmlString
            document.querySelector('#edit').addEventListener('click', prepForEdit)
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
        <button id="submit" class="neutral" type="submit">submit</button>
    </form>`
    document.querySelector('#form').addEventListener('submit', function(e){setUpSubmit(e)})
}

function setUpSubmit(e){
    e.preventDefault()
    const valid = validate()
    if (!valid) return false
    return submitVal(e)
}

function submitAnimation(str = 'submitted'){
    const submit = document.querySelector('#submit')

    setTimeout(function(){
        submit.classList.remove('neutral')
        submit.classList.add('thinking')
        submit.textContent = ''
        setTimeout(function(){
            submit.classList.add('done')
            submit.classList.remove('thinking')
            submit.textContent = str
            submit.removeAttribute('type')
            submit.setAttribute('disabled', '')
            document.querySelector('#title').setAttribute('disabled', '')
            document.querySelector('#textarea').setAttribute('disabled', '')
        }, 1500)
    }, 0)
}

function submitVal(e){
    const newPost = createPost()
    return createOne(newPost)
}

function validate(){
    const input = document.querySelector('#title')
    const textarea = document.querySelector('#textarea') 
    if(input.value === '' || textarea.value === ''){
        alert('Submissions require a body and a title')
        return false
    }
    return true
}

function createPost(){
    const newPost = {}
    const input = document.querySelector('#title')
    const textarea = document.querySelector('#textarea') 
    newPost.title = input.value
    newPost.content = textarea.value
    return newPost
}

function createOne(body){
    axios.post(`${baseURL}/posts`, body)
        .then(result =>{
            submitAnimation()
            document.querySelector('#form').onSubmit = null
        })
        .then(result =>{
            setTimeout(getAll, 1500)
        })
}

///////////////////////////////////////////////////////////////////////////////
//          EDIT ONE
///////////////////////////////////////////////////////////////////////////////
function prepForEdit(){
    const htmlPost = document.querySelector('.htmlPost')
    const editObj = { id: htmlPost.id, postTitle: htmlPost.children[0].textContent, postBody: htmlPost.children[1].textContent }
    enterEditMode(editObj)
    prepButtons()
}

function enterEditMode(obj) {
    document.querySelector('#contentHolder').innerHTML =
        `<form id="form">
        <label for="title" id="${obj.id}">Title</label>
        <input type="text" id="title" value="${obj.postTitle}">
        <label for="textarea">Post</label>
        <textarea name="textInput" id="textarea">${obj.postBody}</textarea>
        <button id="submit" class="neutral" type="submit">submit</button>
        <button id="cancel">cancel</button>
        
    </form>`
}

function prepButtons(){
    const id = document.querySelector('#form').firstElementChild.id
    document.querySelector('#form').addEventListener('submit', function(e){editOne(e)})
    document.querySelector('#cancel').addEventListener('click', function(){cancelEdit(id)})
}

function cancelEdit(id){
    getOne(null, id)
}

function editOne(e) {
    e.preventDefault()
    const form = document.querySelector('#form')
    const newPostObj = { id: form.children[0].id, title: form.children[1].value, content: form.children[3].value }
    axios.patch(`${baseURL}/posts/${newPostObj.id}`, newPostObj)
        .then(result => {
            submitAnimation()
        })
        .then(result => {
            
            setTimeout(function(){
                getAll()
                let id = document.querySelector('#form').firstElementChild.id
                getOne(null, id)
            }, 2000)
        })

}

///////////////////////////////////////////////////////////////////////////////
//          DELETE ONE
///////////////////////////////////////////////////////////////////////////////
function deleteOne() {
    const id = document.querySelector('.htmlPost').id
    axios.delete(`${baseURL}/posts/${id}`)
        .then( result => {
            document.querySelector('#contentHolder').innerHTML = '<h4>Post has been deleted</h4>'
        })
        .then(result => {
          setTimeout(getAll, 1500)
        })
}   