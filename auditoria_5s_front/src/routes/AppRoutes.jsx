import { Route, Routes } from 'react-router-dom'
import HomeRedirect from '../auth/HomeRedirect'
import PermissionRoute from '../auth/PermissionRoute'
import ProtectedRoute from '../auth/ProtectedRoute'
import Layout from '../components/Layout'
import Login from '../pages/auth/Login'
import Local1sForm from '../pages/local1s/Local1sForm'
import Local1sList from '../pages/local1s/Local1sList'
import Local1sView from '../pages/local1s/Local1sView'
import Local2sForm from '../pages/local2s/Local2sForm'
import Local2sList from '../pages/local2s/Local2sList'
import Local2sView from '../pages/local2s/Local2sView'
import Local3sForm from '../pages/local3s/Local3sForm'
import Local3sList from '../pages/local3s/Local3sList'
import Local3sView from '../pages/local3s/Local3sView'
import OperatorsForm from '../pages/operators/OperatorsForm'
import OperatorsList from '../pages/operators/OperatorsList'
import OperatorsView from '../pages/operators/OperatorsView'
import SupervisionsForm from '../pages/supervisions/SupervisionsForm'
import SupervisionsList from '../pages/supervisions/SupervisionsList'
import SupervisionsView from '../pages/supervisions/SupervisionsView'
import UsersForm from '../pages/users/UsersForm'
import UsersList from '../pages/users/UsersList'
import UsersView from '../pages/users/UsersView'
import VerificationCriteriaForm from '../pages/verificationCriteria/VerificationCriteriaForm'
import VerificationCriteriaList from '../pages/verificationCriteria/VerificationCriteriaList'
import VerificationCriteriaView from '../pages/verificationCriteria/VerificationCriteriaView'
import WorkEnvironmentsForm from '../pages/workEnvironments/WorkEnvironmentsForm'
import WorkEnvironmentCriteria from '../pages/workEnvironments/WorkEnvironmentCriteria'
import WorkEnvironmentsList from '../pages/workEnvironments/WorkEnvironmentsList'
import WorkEnvironmentsView from '../pages/workEnvironments/WorkEnvironmentsView'

function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<HomeRedirect />} />

          <Route element={<PermissionRoute permission="local1s.view" />}>
            <Route path="local1s" element={<Local1sList />} />
            <Route path="local1s/:id" element={<Local1sView />} />
          </Route>
          <Route element={<PermissionRoute permission="local1s.create" />}>
            <Route path="local1s/create" element={<Local1sForm />} />
          </Route>
          <Route element={<PermissionRoute permission="local1s.update" />}>
            <Route path="local1s/:id/edit" element={<Local1sForm />} />
          </Route>

          <Route element={<PermissionRoute permission="local2s.view" />}>
            <Route path="local2s" element={<Local2sList />} />
            <Route path="local2s/:id" element={<Local2sView />} />
          </Route>
          <Route element={<PermissionRoute permission="local2s.create" />}>
            <Route path="local2s/create" element={<Local2sForm />} />
          </Route>
          <Route element={<PermissionRoute permission="local2s.update" />}>
            <Route path="local2s/:id/edit" element={<Local2sForm />} />
          </Route>

          <Route element={<PermissionRoute permission="local3s.view" />}>
            <Route path="local3s" element={<Local3sList />} />
            <Route path="local3s/:id" element={<Local3sView />} />
          </Route>
          <Route element={<PermissionRoute permission="local3s.create" />}>
            <Route path="local3s/create" element={<Local3sForm />} />
          </Route>
          <Route element={<PermissionRoute permission="local3s.update" />}>
            <Route path="local3s/:id/edit" element={<Local3sForm />} />
          </Route>

          <Route element={<PermissionRoute permission="work_environments.view" />}>
            <Route path="work-environments" element={<WorkEnvironmentsList />} />
            <Route path="work-environments/:id" element={<WorkEnvironmentsView />} />
            <Route path="work-environments/:id/criteria" element={<WorkEnvironmentCriteria />} />
          </Route>
          <Route element={<PermissionRoute permission="work_environments.create" />}>
            <Route path="work-environments/create" element={<WorkEnvironmentsForm />} />
          </Route>
          <Route element={<PermissionRoute permission="work_environments.update" />}>
            <Route path="work-environments/:id/edit" element={<WorkEnvironmentsForm />} />
          </Route>

          <Route element={<PermissionRoute permission="verification_criteria.view" />}>
            <Route path="verification-criteria" element={<VerificationCriteriaList />} />
            <Route path="verification-criteria/:id" element={<VerificationCriteriaView />} />
          </Route>
          <Route element={<PermissionRoute permission="verification_criteria.create" />}>
            <Route path="verification-criteria/create" element={<VerificationCriteriaForm />} />
          </Route>
          <Route element={<PermissionRoute permission="verification_criteria.update" />}>
            <Route path="verification-criteria/:id/edit" element={<VerificationCriteriaForm />} />
          </Route>

          <Route element={<PermissionRoute permission="supervisions.view" />}>
            <Route path="supervisions" element={<SupervisionsList />} />
            <Route path="supervisions/:id" element={<SupervisionsView />} />
          </Route>
          <Route element={<PermissionRoute permission="supervisions.create" />}>
            <Route path="supervisions/create" element={<SupervisionsForm />} />
          </Route>
          <Route element={<PermissionRoute permission="supervisions.view" />}>
            <Route path="supervisions/:id/edit" element={<SupervisionsForm />} />
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

          <Route element={<PermissionRoute permission="operators.view" />}>
            <Route path="operators" element={<OperatorsList />} />
            <Route path="operators/:id" element={<OperatorsView />} />
          </Route>
          <Route element={<PermissionRoute permission="operators.create" />}>
            <Route path="operators/create" element={<OperatorsForm />} />
          </Route>
          <Route element={<PermissionRoute permission="operators.update" />}>
            <Route path="operators/:id/edit" element={<OperatorsForm />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes
