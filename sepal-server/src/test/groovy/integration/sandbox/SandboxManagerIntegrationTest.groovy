package integration.sandbox

import endtoend.SepalDriver
import org.openforis.sepal.sandbox.*
import org.openforis.sepal.user.JDBCUserRepository
import org.openforis.sepal.user.UserRepository
import spock.lang.Ignore
import spock.lang.Shared
import spock.lang.Specification

import static org.openforis.sepal.sandbox.Sandbox.State


class SandboxManagerIntegrationTest extends Specification {

    private static final String A_USER = "A_USER"

    @Shared SepalDriver sepalDriver
    @Shared UserRepository userRepository
    @Shared SandboxManager sandboxManager
    @Shared DockerClient dockerClient

    def setupSpec() {
        sepalDriver = new SepalDriver()
        sepalDriver.withUsers(A_USER)
        userRepository = new JDBCUserRepository(sepalDriver.getSQLManager())

        dockerClient = Stub(DockerClient) {
            getSandbox(_) >> new Sandbox(id: "id", image: "image", name: "name", uri: "uri", state: new State(true))
            createSandbox(_, _, _) >> new Sandbox(id: "id", image: "image", name: "name", uri: "uri", state: new State(true))
        }

        sandboxManager = new DockerSandboxManager(userRepository, dockerClient, "sandbox")
    }

    def cleanupSpec() {
        sepalDriver.stop()
    }

    def 'asking a sandbox for a non existing user, an exception is thrown'() {
        when:
            sandboxManager.obtain("N/A")
        then:
            thrown(NonExistingUser)
    }

    def 'asking a sandbox for an existing user, it will succeed'() {
        when:
            def sandbox = sandboxManager.obtain(A_USER)
        then:
            sandbox.state.running == new State(true).running
    }
}
