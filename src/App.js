import React, { Component } from 'react';
import Comments from './Comments';
import CommentsForm from './CommentForm';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden : true
    }
    this.handleShowForm = this.handleShowForm.bind(this);
  }

  handleShowForm(){
    this.setState((prevState)=>{
      return {
        hidden : !prevState.hidden
      }
    })
  }

  render(){
    return (
      <div className='container'>
          <button className="button" onClick={this.handleShowForm}>Add Comment</button>
          <CommentsForm hidden={this.state.hidden} onSubmit={this.handleShowForm}/>
          <Comments/>
      </div>
      )
  }
}

export default App;
