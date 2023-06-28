import { loginRequired, register, login } from '../Controllers/authController.js';

import { 
    getCandidates, postCandidate, deleteCandidate, updateCandidate, postElection, deleteElection,updateElection, getResults, 
    getStatistics, getVoters, postVoter, deleteVoter, updateVoter, getCountDown,
    getPositions, updatePosition, deletePosition, postPosition, postAdmin
} from '../Controllers/adminController.js';

import { 
    castVote, getVotingHistory, getElection, getActiveElection, hasVoted
} from '../Controllers/voterController.js';

const routes = (app) => {
    app.route('/auth/register')
        .post(register);
    app.route('/admin/register')
        .post(postAdmin);
    app.route('/auth/login')
        .post(login);
    app.route('/api/countdown')
        .get(getCountDown);
    app.route('/admin/candidates')
        .get(loginRequired, getCandidates)
        .post(loginRequired, postCandidate);
    app.route('/admin/candidates/:id')
        .delete(loginRequired, deleteCandidate)
        .put(loginRequired, updateCandidate);
    app.route('/admin/positions')
        .get(loginRequired, getPositions)
        .post(loginRequired, postPosition);
    app.route('/admin/positions/:id')
        .delete(loginRequired, deletePosition)
        .put(loginRequired, updatePosition);
    app.route('/admin/election')
        .get(loginRequired, getElection)
        .post(loginRequired, postElection);
    app.route('/admin/election/:id')
        .put(loginRequired, updateElection)
        .delete(loginRequired, deleteElection);
    app.route('/admin/results')
        .get(loginRequired, getResults);
    app.route('/admin/statistics')
        .get(loginRequired, getStatistics);
    app.route('/admin/voters')
        .get( loginRequired, getVoters)
        .post(loginRequired, postVoter);
    app.route('/admin/voters/:id')
        .delete(loginRequired, deleteVoter)
        .put(loginRequired, updateVoter);
    app.route('/voter/vote')
        .post(loginRequired, castVote);
    app.route('/voter/voting-history')
        .get(loginRequired, getVotingHistory);
    app.route('/voter/results')
        .get(loginRequired, getResults);
    app.route('/voter/active-election')
        .get(loginRequired, getActiveElection);
    app.route('/voter/has-voted')
        .get(loginRequired, hasVoted);
};

export default routes;