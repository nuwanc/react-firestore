import React, { Component } from 'react';
import db from './firestore';

class CommentForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            name : '',
            rating : '1',
            text : ''
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
    
        this.setState({
          [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        
        db.collection("comments").add({
            name : this.state.name,
            rating : this.state.rating,
            text : this.state.text
        });

        this.setState(()=>{
            return {
                name : '',
                rating : '1',
                text : ''
            }
        })
        this.props.onSubmit();
      }
    

    render() {
        return (
            <form className='column' onSubmit={this.handleSubmit} style={this.props.hidden ? { display:'none'} : null}>
                <label htmlFor='name'>Name</label>
                <input id='name' placeholder='Name' type='text' autoComplete='off' name="name" value={this.state.name} onChange={this.handleInputChange}/>
                <label htmlFor='rating'>Rating</label>
                <span>
                    <label><input type="radio" name="rating" value="1" defaultChecked={this.state.rating === '1'} onClick={this.handleInputChange}/> 1</label>
                    <label><input type="radio" name="rating" value="2" defaultChecked={this.state.rating === '2'} onClick={this.handleInputChange}/> 2</label>
                    <label><input type="radio" name="rating" value="3" defaultChecked={this.state.rating === '3'} onClick={this.handleInputChange}/> 3</label>
                    <label><input type="radio" name="rating" value="4" defaultChecked={this.state.rating === '4'} onClick={this.handleInputChange}/> 4</label>
                    <label><input type="radio" name="rating" value="5" defaultChecked={this.state.rating === '5'} onClick={this.handleInputChange}/> 5</label>
                </span>
                <label htmlFor='text'>Comment</label>
                <textarea id='text' placeholder='text' autoComplete='off' name='text' value={this.state.text} onChange={this.handleInputChange}/>
                <button className='button' type='submit' disabled={!this.state.name}>Submit</button>
            </form>
        )
    }
}

export default CommentForm