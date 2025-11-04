import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';

type RatingModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
  orderNumber?: string;
};

export default function RatingModal({ 
  visible, 
  onClose, 
  onSubmit,
  orderNumber 
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Por favor, selecione uma classificação');
      return;
    }
    onSubmit(rating, review);
    // Reset
    setRating(0);
    setReview('');
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 shadow-2xl">
          {/* Header */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold mb-2">
              Como foi sua experiência?
            </Text>
            {orderNumber && (
              <Text className="text-gray-500">
                Pedido #{orderNumber}
              </Text>
            )}
          </View>

          {/* Stars */}
          <View className="flex-row justify-center items-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                className="p-2"
              >
                <Text
                  className={`text-5xl ${
                    star <= (hoverRating || rating)
                      ? 'opacity-100'
                      : 'opacity-30'
                  }`}
                >
                  ⭐
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating Text */}
          {rating > 0 && (
            <Text className="text-center text-lg font-semibold mb-4 text-primary">
              {rating === 1 && '😞 Muito Ruim'}
              {rating === 2 && '😕 Ruim'}
              {rating === 3 && '😐 Regular'}
              {rating === 4 && '😊 Bom'}
              {rating === 5 && '🤩 Excelente'}
            </Text>
          )}

          {/* Comment Box */}
          <TextInput
            className="border border-gray-300 rounded-lg p-4 mb-6 min-h-24"
            placeholder="Deixe um comentário (opcional)..."
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-lg p-4"
              onPress={handleClose}
            >
              <Text className="text-gray-800 font-bold text-center text-lg">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-primary rounded-lg p-4"
              onPress={handleSubmit}
            >
              <Text className="text-white font-bold text-center text-lg">
                Enviar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}