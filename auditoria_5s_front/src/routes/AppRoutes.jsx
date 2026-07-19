import { Route, Routes } from 'react-router-dom'
import HomeRedirect from '../auth/HomeRedirect'
import PermissionRoute from '../auth/PermissionRoute'
import ProtectedRoute from '../auth/ProtectedRoute'
import Layout from '../components/Layout'
import AssessmentForm from '../pages/assessments/AssessmentForm'
import AssessmentsList from '../pages/assessments/AssessmentsList'
import AssessmentView from '../pages/assessments/AssessmentView'
import Login from '../pages/auth/Login'
import MethodologiesForm from '../pages/methodologies/MethodologiesForm'
import MethodologiesList from '../pages/methodologies/MethodologiesList'
import MethodologiesView from '../pages/methodologies/MethodologiesView'
import OrganizationsForm from '../pages/organizations/OrganizationsForm'
import OrganizationsList from '../pages/organizations/OrganizationsList'
import OrganizationsView from '../pages/organizations/OrganizationsView'
import ActivitiesForm from '../pages/activities/ActivitiesForm'
import PeopleForm from '../pages/people/PeopleForm'
import PeopleList from '../pages/people/PeopleList'
import PeopleView from '../pages/people/PeopleView'
import ProcessesForm from '../pages/processes/ProcessesForm'
import ProcessesList from '../pages/processes/ProcessesList'
import ProcessesView from '../pages/processes/ProcessesView'
import PublicAssessmentAnswer from '../pages/public/PublicAssessmentAnswer'
import QuestionsForm from '../pages/questions/QuestionsForm'
import QuestionsList from '../pages/questions/QuestionsList'
import QuestionsView from '../pages/questions/QuestionsView'
import QuestionnairesForm from '../pages/questionnaires/QuestionnairesForm'
import QuestionnairesList from '../pages/questionnaires/QuestionnairesList'
import QuestionnairesView from '../pages/questionnaires/QuestionnairesView'
import SectorsForm from '../pages/sectors/SectorsForm'
import SectorsList from '../pages/sectors/SectorsList'
import SectorsView from '../pages/sectors/SectorsView'
import UnitsForm from '../pages/units/UnitsForm'
import UnitsList from '../pages/units/UnitsList'
import UnitsView from '../pages/units/UnitsView'
import UsersForm from '../pages/users/UsersForm'
import UsersList from '../pages/users/UsersList'
import UsersView from '../pages/users/UsersView'

function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="answer/:accessCode" element={<PublicAssessmentAnswer />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<HomeRedirect />} />
          <Route element={<PermissionRoute permission="organizations.view" />}>
            <Route path="organizations" element={<OrganizationsList />} />
            <Route path="organizations/:id" element={<OrganizationsView />} />
          </Route>
          <Route element={<PermissionRoute permission="organizations.create" />}>
            <Route path="organizations/create" element={<OrganizationsForm />} />
          </Route>
          <Route element={<PermissionRoute permission="organizations.update" />}>
            <Route path="organizations/:id/edit" element={<OrganizationsForm />} />
          </Route>

          <Route element={<PermissionRoute permission="units.view" />}>
            <Route path="units" element={<UnitsList />} />
            <Route path="units/:id" element={<UnitsView />} />
          </Route>
          <Route element={<PermissionRoute permission="units.create" />}>
            <Route path="units/create" element={<UnitsForm />} />
          </Route>
          <Route element={<PermissionRoute permission="units.update" />}>
            <Route path="units/:id/edit" element={<UnitsForm />} />
          </Route>

          <Route element={<PermissionRoute permission="sectors.view" />}>
            <Route path="sectors" element={<SectorsList />} />
            <Route path="sectors/:id" element={<SectorsView />} />
          </Route>
          <Route element={<PermissionRoute permission="sectors.create" />}>
            <Route path="sectors/create" element={<SectorsForm />} />
          </Route>
          <Route element={<PermissionRoute permission="sectors.update" />}>
            <Route path="sectors/:id/edit" element={<SectorsForm />} />
          </Route>

          <Route element={<PermissionRoute permission="processes.view" />}>
            <Route path="processes" element={<ProcessesList />} />
            <Route path="processes/:id" element={<ProcessesView />} />
          </Route>
          <Route element={<PermissionRoute permission="processes.create" />}>
            <Route path="processes/create" element={<ProcessesForm />} />
          </Route>
          <Route element={<PermissionRoute permission="processes.update" />}>
            <Route path="processes/:id/edit" element={<ProcessesForm />} />
          </Route>
          <Route element={<PermissionRoute permission="activities.create" />}>
            <Route path="processes/:processId/activities/create" element={<ActivitiesForm />} />
          </Route>
          <Route element={<PermissionRoute permission="activities.update" />}>
            <Route path="activities/:id/edit" element={<ActivitiesForm />} />
          </Route>

          <Route element={<PermissionRoute permission="people.view" />}>
            <Route path="people" element={<PeopleList />} />
            <Route path="people/:id" element={<PeopleView />} />
          </Route>
          <Route element={<PermissionRoute permission="people.create" />}>
            <Route path="people/create" element={<PeopleForm />} />
          </Route>
          <Route element={<PermissionRoute permission="people.update" />}>
            <Route path="people/:id/edit" element={<PeopleForm />} />
          </Route>

          <Route element={<PermissionRoute permission="users.view" />}>
            <Route path="users" element={<UsersList />} />
            <Route path="users/:id" element={<UsersView />} />
          </Route>
          <Route element={<PermissionRoute permission="users.create" />}>
            <Route path="users/create" element={<UsersForm />} />
          </Route>
          <Route element={<PermissionRoute permission="users.update" />}>
            <Route path="users/:id/edit" element={<UsersForm />} />
          </Route>

          <Route element={<PermissionRoute permission="methodologies.view" />}>
            <Route path="methodologies" element={<MethodologiesList />} />
            <Route path="methodologies/:id" element={<MethodologiesView />} />
          </Route>
          <Route element={<PermissionRoute permission="methodologies.create" />}>
            <Route path="methodologies/create" element={<MethodologiesForm />} />
          </Route>
          <Route element={<PermissionRoute permission="methodologies.update" />}>
            <Route path="methodologies/:id/edit" element={<MethodologiesForm />} />
          </Route>

          <Route element={<PermissionRoute permission="questionnaires.view" />}>
            <Route path="questionnaires" element={<QuestionnairesList />} />
            <Route path="questionnaires/:id" element={<QuestionnairesView />} />
          </Route>
          <Route element={<PermissionRoute permission="questionnaires.create" />}>
            <Route path="questionnaires/create" element={<QuestionnairesForm />} />
          </Route>
          <Route element={<PermissionRoute permission="questionnaires.update" />}>
            <Route path="questionnaires/:id/edit" element={<QuestionnairesForm />} />
          </Route>

          <Route element={<PermissionRoute permission="questions.view" />}>
            <Route path="questions" element={<QuestionsList />} />
            <Route path="questions/:id" element={<QuestionsView />} />
          </Route>
          <Route element={<PermissionRoute permission="questions.create" />}>
            <Route path="questions/create" element={<QuestionsForm />} />
          </Route>
          <Route element={<PermissionRoute permission="questions.update" />}>
            <Route path="questions/:id/edit" element={<QuestionsForm />} />
          </Route>

          <Route element={<PermissionRoute permission="assessments.view" />}>
            <Route path="assessments" element={<AssessmentsList />} />
            <Route path="assessments/:id" element={<AssessmentView />} />
          </Route>
          <Route element={<PermissionRoute permission="assessments.create" />}>
            <Route path="assessments/create" element={<AssessmentForm />} />
          </Route>
          <Route element={<PermissionRoute permission="assessments.update" />}>
            <Route path="assessments/:id/edit" element={<AssessmentForm />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes
