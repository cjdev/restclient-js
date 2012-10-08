import com.googlecode.qunitTestDriver.QUnitTestDriver;
import com.googlecode.qunitTestDriver.config.TestTimeout;
import org.junit.Test;

public class RunQunitTest {

    @Test
    public void theTests() {
        QUnitTestDriver.run("Tests.html", new TestTimeout(30000));
    }
}
