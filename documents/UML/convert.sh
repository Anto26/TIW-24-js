#!/bin/bash

# Percorso della cartella corrente
cartella_corrente=$(pwd)

# Ciclo per ogni file mmd nella cartella corrente
for file_mmd in "$cartella_corrente"/*.mmd; do
  # Estrai il nome del file senza l'estensione
  nome_file_senza_estensione="${file_mmd##*/}"
  nome_file_senza_estensione="${nome_file_senza_estensione%.*}"

  # Esegui il comando mmdc per generare l'immagine PNG
  mmdc -i "$file_mmd" -o "$nome_file_senza_estensione.png" -w 5000 -f -b transparent
done
