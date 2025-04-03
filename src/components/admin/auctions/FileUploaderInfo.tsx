
import React from "react";
import { MAX_FILE_SIZE, MAX_CARS } from "@/utils/auctionFileProcessing";

export const FileUploaderInfo = () => {
  return (
    <div className="text-sm text-muted-foreground">
      Uwaga: Wczytanie nowego pliku spowoduje usunięcie wszystkich istniejących danych. 
      Maksymalny rozmiar pliku: {MAX_FILE_SIZE / (1024 * 1024)}MB, maksymalna liczba samochodów: {MAX_CARS.toLocaleString()}.
      Samochody bez tytułu (title) lub URL ogłoszenia (detailUrl) zostaną pominięte.
    </div>
  );
};
