import Component, { tracked } from '@glimmer/component';
import tpfTakerDataService from '../../../data/tpf-taker';
import TpfTakerDataService from '../../../data/tpf-taker';

export default class TpfTakerView extends Component {
    @tracked currentTaker
    @tracked takerId: number
    @tracked stuff: number
    service: TpfTakerDataService

    didInsertElement() {
        this.service = new TpfTakerDataService();
        const service = new TpfTakerDataService();
        // find out how to use it as a goddamn component and pass this in
        this.takerId = 449559;
        service.getTpfTaker(this.takerId).then((response) => {
            debugger;
            this.currentTaker = JSON.stringify(response.data);
        });
    }
}
