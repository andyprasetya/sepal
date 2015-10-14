package unit.sandbox

import org.openforis.sepal.sandbox.DockerClient
import org.openforis.sepal.sandbox.DockerSandboxManager
import org.openforis.sepal.sandbox.Sandbox
import org.openforis.sepal.user.UserRepository
import spock.lang.Ignore
import spock.lang.Specification

import static org.openforis.sepal.sandbox.Sandbox.State


class SandboxManagerTest extends Specification {

    def static A_IMAGE_NAME = "Docker_Image_Name"
    def static A_USER = "Test.User"
    def static A_USER_2 = "Test.User2"
    def static A_USER_UID = 12012

    def userRepo = new FakeUserRepository()
    def dockerClient = new FakeDockerClient()
    def dockMockedClient
    def userMockedRepo
    def mockedManager


    def manager = new DockerSandboxManager(
            userRepo,
            dockerClient,
            A_IMAGE_NAME
    )


    def setup() {
        userMockedRepo = Spy(FakeUserRepository)


        dockMockedClient = Mock(DockerClient)
        mockedManager = new DockerSandboxManager(
                userMockedRepo,
                dockMockedClient,
                A_IMAGE_NAME
        )
    }


    def 'given a new sandbox request. DockerClient.createSandbox() is invoked'() {

        when:
            mockedManager.obtain(A_USER)
        then:
            1 * userMockedRepo.getSandboxId(A_USER)
            1 * userMockedRepo.getUserUid(_)
            1 * dockMockedClient.createSandbox(A_IMAGE_NAME, A_USER, A_USER_UID)
    }


    def 'Given a new sandbox request, if a sandbox is already running for a particular user. The sandbox should be recycled'() {
        when:
            def request1 = manager.obtain(A_USER)
            def request2 = manager.obtain(A_USER)
        then:
            request1.id == request2.id
    }


    def 'Given two sandbox requests from 2 different users. Two new sandboxes should be created'() {
        when:
            def request1 = manager.obtain(A_USER)
            def request2 = manager.obtain(A_USER_2)
        then:
            request1.id != request2.id
    }


    static class FakeUserRepository implements UserRepository {

        private Map<String, String> usersSandboxes = [:]

        @Override
        String getSandboxURI(String username) {
            return null
        }

        @Override
        Boolean userExist(String username) {
            return true
        }

        @Override
        String getSandboxId(String username) {
            return usersSandboxes.get(username)
        }

        @Override
        int getUserUid(String username) {
            return A_USER_UID
        }

        @Override
        void update(String username, String sandboxId, String sandboxURI) {
            usersSandboxes.put(username, sandboxId)
        }
    }

    static class FakeDockerClient implements DockerClient {

        private Map<String, Sandbox> dockerSandboxes = [:]

        @Override
        def exec(String sandboxId, String... commands) {
            return null
        }

        @Override
        Sandbox getSandbox(String identifier) {
            return dockerSandboxes.get(identifier)
        }

        @Override
        def releaseSandbox(String sandboxId) {
            dockerSandboxes.remove(sandboxId)
        }

        @Override
        def stopSandbox(String sandboxId) {
            return null
        }

        @Override
        def createSandbox(String sandboxName, String username, int userId) {
            def identifier = UUID.randomUUID().toString()
            Sandbox sandbox = new Sandbox(id: identifier, state: new State(true))
            dockerSandboxes.put(identifier, sandbox)
            return sandbox
        }
    }

}







