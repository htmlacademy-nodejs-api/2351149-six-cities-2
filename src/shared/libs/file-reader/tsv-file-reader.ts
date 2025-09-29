import {readFileSync} from 'node:fs';
import {Author, Coordinates, FacilityType, RentalOffer, RentalOfferType, UserType} from '../../types/index.js';

export class TSVFileReader {
  private rawData = '';
  constructor(private readonly filename: string) {}

  public read(): void {
    this.rawData = readFileSync(this.filename, { encoding: 'utf8' });
  }

  public toArray(): RentalOffer[] {
    if (!this.rawData) {
      throw new Error('File was not read');
    }

    return this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((line) => line.split('\t'))
      .map(([name, description, publishDate, city, imagePreview, photos, isPremium, isFavourite, rating, type, roomNumber, guestNumber, price, facilities, author, commentsCount, coordinates]) => ({
        name,
        description,
        publishDate: new Date(publishDate),
        city,
        imagePreview,
        photos: photos.split(';').map((photo) => photo),
        isPremium: Boolean(isPremium),
        isFavourite: Boolean(isFavourite),
        rating: parseFloat(Number(rating).toFixed(1)),
        type: RentalOfferType[type as 'apartment' | 'house' | 'room' | 'hotel'],
        roomNumber: Number.parseInt(roomNumber, 10),
        guestNumber: Number.parseInt(guestNumber, 10),
        price: Number.parseInt(price, 10),
        facilities: this.parseFacilities(facilities),
        author: this.parseAuthor(author),
        commentsCount: Number.parseInt(commentsCount, 10),
        coordinates: this.parseCoordinates(coordinates)
      }));
  }

  private parseFacilities(facilitiesRaw: string): FacilityType[] {
    return facilitiesRaw.split(';').map((facility) => {
      const facilityKey = Object.keys(FacilityType).find((key) => FacilityType[key as keyof typeof FacilityType] === facility);
      return facilityKey ? FacilityType[facilityKey as keyof typeof FacilityType] : undefined;
    }).filter((facility): facility is FacilityType => facility !== undefined);
  }

  private parseAuthor(authorRaw: string): Author {
    const [userName, email, avatar, password, userType] = authorRaw.split(';');
    return {
      name: userName,
      email,
      avatar,
      password,
      userType: UserType[userType as UserType],
    };
  }

  private parseCoordinates(coordinatesRaw: string): Coordinates {
    const [longitude, latitude] = coordinatesRaw.split(';');
    return {
      longitude: Number(longitude),
      latitude: Number(latitude)
    };
  }
}
