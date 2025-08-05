import mongoose from 'mongoose';

const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    id:{
        type: String,
        required: true,
        unique:true,
      },
    jobSeekerId:{
        type: String,
        required: true,
      },  
    employerId:{
        type: String,
        required: true,
      },
    readByEmployer:{
        type: Boolean,
        required: true,
      },  
    readByJobSeeker:{
        type: Boolean,
        required: true,
      },          
    
    lastMessage: {
      type: String,
      required: false,
    },
    
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);