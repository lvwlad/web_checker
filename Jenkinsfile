pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'сборка'
                sh 'docker build .'
            }
        }
    }
    post {
        success {
            echo "It wokks"
        }
        failure {
            echo "It doesn't work"
        }
    }
}