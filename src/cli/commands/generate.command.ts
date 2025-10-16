import { Command } from './command.interface.js';
import { MockServerData } from '../../shared/types/index.js';
import { TSVRentalOfferGenerator } from '../../shared/libs/rental-offer-generator/index.js';
import { TSVFileWriter } from '../../shared/libs/file-writer/index.js';
import { getErrorMessage } from '../../shared/helpers/index.js';
import axios from 'axios';

export class GenerateCommand implements Command {
  private initialData: MockServerData;

  private async load(url: string) {
    try {
      const res = await axios.get(url);
      this.initialData = res.data;
      if (!this.initialData || !this.initialData.names || !this.initialData.cities) {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      throw new Error(`Can't load data from ${url}`);
    }
  }

  private async write(filepath: string, rentalOfferCount: number) {
    const tsvOfferGenerator = new TSVRentalOfferGenerator(this.initialData);
    const tsvFileWriter = new TSVFileWriter(filepath);

    console.info(`Generating ${rentalOfferCount} offers...`);

    for (let i = 0; i < rentalOfferCount; i++) {
      await tsvFileWriter.write(tsvOfferGenerator.generate());

      if ((i + 1) % 10 === 0) {
        console.info(`Generated ${i + 1}/${rentalOfferCount} offers...`);
      }
    }
  }

  public getName(): string {
    return '--generate';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [count, filepath, url] = parameters;
    const rentalOfferCount = Number.parseInt(count, 10);

    try {
      await this.load(url);
      await this.write(filepath, rentalOfferCount);
      console.info(`${rentalOfferCount} offers generated successfully.`);
      console.info(`File created: ${filepath}`);
    } catch (error: unknown) {
      console.error('Can\'t generate data');
      console.error(getErrorMessage(error));
    }
  }
}
