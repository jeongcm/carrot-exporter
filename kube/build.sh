#!/bin/bash
set +e
APP_IMAGE_NAME=$1
DOCKER_IMAGE_REGISTRY=$HARBOR_URL/$HARBOR_PROJECT_NAME


if [ $# -lt 1 ]; then
    echo 'Usage: e.g. build.sh ${APP_IMAGE_NAME}'
    exit 1
fi

formatSection() {
  echo ''
  echo '##########################################################'
  echo "$1"
  echo '##########################################################'
  echo ''
}


check_exit(){
  if [[ $? != 0 ]]
  then
    exit 1
  fi
}

GIT_REV=$(git log -n 1 --pretty=format:%h)
IMAGE_TAG=$CI_COMMIT_SHORT_SHA

LOCAL_IMAGE=${APP_IMAGE_NAME}:${IMAGE_TAG}
APP_IMAGE=$APP_IMAGE_NAME
APP_IMAGE_COMMIT=${APP_IMAGE}:${IMAGE_TAG}

export REMOTE_IMAGE=${DOCKER_IMAGE_REGISTRY}/${APP_IMAGE}
export REMOTE_IMAGE_COMMIT=${REMOTE_IMAGE}:${IMAGE_TAG}
export REMOTE_IMAGE_LATEST=${REMOTE_IMAGE}:latest

echo -e "LOCAL_IMAGE\t\t=\t$LOCAL_IMAGE"
echo -e "REMOTE_IMAGE\t\t=\t$REMOTE_IMAGE"
echo ""
echo -e "APP_IMAGE\t\t=\t$APP_IMAGE"
echo -e "APP_IMAGE_COMMIT\t=\t$APP_IMAGE_COMMIT"
echo ""
echo -e "REMOTE_IMAGE_COMMIT\t=\t$REMOTE_IMAGE_COMMIT"
echo -e "REMOTE_IMAGE_LATEST\t=\t$REMOTE_IMAGE_LATEST"


formatSection "Creating local image $LOCAL_IMAGE ..."
docker login -u $HARBOR_USER --password-stdin "https://$DOCKER_IMAGE_REGISTRY" < $HARBOR_PASSWORD
check_exit

docker build --target development-build-stage  -f $APP_DOCKERFILE_LOCATION -t $LOCAL_IMAGE ${DOCKER_CONTEXT:-"."}
check_exit

formatSection "TAG/PUSH GIT HASH IMAGE $REMOTE_IMAGE_COMMIT ..."
docker tag ${LOCAL_IMAGE} ${REMOTE_IMAGE_COMMIT}
docker push ${REMOTE_IMAGE_COMMIT}

formatSection "TAG/PUSH LATEST $REMOTE_IMAGE_LATEST"
docker tag ${LOCAL_IMAGE} ${REMOTE_IMAGE_LATEST}
docker push ${REMOTE_IMAGE_LATEST}


echo "Cleaning up local files..."
docker image rm ${REMOTE_IMAGE_LATEST}
docker image rm ${REMOTE_IMAGE_COMMIT}
docker image rm ${LOCAL_IMAGE}
