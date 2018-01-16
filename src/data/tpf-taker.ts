// TODO: can you access out of src from within ? doesn't seem like it.
// import { environment } from '../../config/environment';

export default class TpfTakerDataService {
    apiRoot: string;

    constructor() {
        // terrible hard code.
        this.apiRoot = 'http://localhost:4141'
    }

    async getTpfTaker(takerId: number) {
        // todo: have a routes file with all paths etc...
        const path = 'tpf-takers';
        // terrible url buliding.  all of this will need to be waaaay more extensible, auth, models etc.
        const token = '';
        const response = await fetch(`${this.apiRoot}/${path}/?takerId=${takerId}`, {
            headers: new Headers({
                'Authorization': `Bearer ${token}`
            })
        });
        const json = await response.json();
        return json;
    }
}