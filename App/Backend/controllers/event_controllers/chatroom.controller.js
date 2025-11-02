import Event from '../models/event.model.js';
import { getIo } from '../services/socket.service.js';


export const fetchAllMessages = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
                             .select('chatRoom') 
                             .populate('chatRoom.sender', 'name'); 

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(event.chatRoom);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error while fetching messages' });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { message } = req.body;
    const senderId = req.user.id; 

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const newMessage = {
      sender: senderId,
      message: message,
      createdAt: new Date(),
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $push: { chatRoom: newMessage } },
      { new: true, fields: { chatRoom: 1 } } 
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    let newSavedMessage = updatedEvent.chatRoom[updatedEvent.chatRoom.length - 1];
    newSavedMessage = await newSavedMessage.populate('sender', 'name');

    const io = getIo();
    
    io.to(eventId).emit('receive_message', newSavedMessage);

    res.status(201).json(newSavedMessage);

  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ error: 'Server error while posting message' });
  }
};