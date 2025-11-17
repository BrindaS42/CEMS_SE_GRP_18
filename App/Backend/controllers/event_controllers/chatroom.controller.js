import Event from '../../models/event.model.js';
import { getIo } from '../../services/socket.service.js';


export const fetchAllMessages = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
                             .select('chatRoom') 
                             .populate('chatRoom.sender', 'profile role'); 

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(event.chatRoom);
  } catch (error) {
    console.error('[Chat Controller] ❌ Error fetching messages:', error);
    res.status(500).json({ error: 'Server error while fetching messages' });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { message } = req.body;
    const senderId = req.user.id; 

    console.log(`[Chat Controller] ➡️ Received message post for event: ${eventId}`);

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

    // Populate the sender of the newly added message before emitting
    const populatedEvent = await updatedEvent.populate({
      path: 'chatRoom.sender',
      select: 'profile role' // Populate profile and role
    });
    const newSavedMessage = populatedEvent.chatRoom[populatedEvent.chatRoom.length - 1];

    const io = getIo();
    console.log(`[Chat Controller] 📡 Emitting 'receive_message' to room: ${eventId}`);
    io.to(eventId).emit('receive_message', { ...newSavedMessage.toObject(), eventId });

    res.status(201).json({ ...newSavedMessage.toObject(), eventId });

  } catch (error) {
    console.error('[Chat Controller] ❌ Error posting message:', error);
    res.status(500).json({ error: 'Server error while posting message' });
  }
};