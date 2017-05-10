export class Appointment {
    FullName: string;
    TimeSlot: string;
    Email: string;
    Date: Date;
    Questionnaire: string;
    IsDoctor: boolean;
    ItemId: number;

    constructor() {
        this.TimeSlot = '';
        this.Questionnaire = '';
    }

}
