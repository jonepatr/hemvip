# Documentation for Experimenters

## Configuring an Experiment

### General

An experiment is configured by config files written in YAML. 
The config files must be placed in the subfolder "/configs". 
When the webMUSHRA page (e.g. http://localhost/webMUSHRA) is accessed, default.yaml is loaded. 
In case another config file should be loaded, a parameter "config" must be added to the url. 
E.g. http://localhost/webMUSHRA?config=example.yaml loads the config stored in "/configs/example.yaml". 
Filepaths in the config files are always relative to the root folder "/".

### Configuration

At the top level of the config file, general options of the experiment are stored.

* **testname** Name of your listening test as it is shown to the participants. 
* **testId** Identifier of your listening test which is also stored into the result files.
* **bufferSize** The buffer size that is used for the audio processing. The smaller the buffer size, the smaller is the latency. However, small buffer sizes increase the computational load which can lead to audible artifacts. The buffer size must be one of the following values: 256, 512, 1024, 2048, 4096, 8192 or 16384.
* **stopOnErrors** If set to true, the experiment will stop on any errors (e.g. if samples sizes do not match). Please watch the console log especially when unexpected behaviour occurs.
* **showButtonPreviousPage** If set to true, the participant can navigate to previous pages.
* **remoteService** A service/URL to which the results (JSON object) are sent. A PHP web service ("service/write.php") is available which writes the results into the "/results" folder. 
* **pages** An array of experiment pages, random keyword or an pages array ([Array]). 

#### `random`

If the string "random" is the first element of an pages array, the content of the array is randomized (e.g. used for randomized experiments).

#### `generic` page

A generic page contains any content in HTML (e.g. useful for showing the instructions to the participants).

* **type** must be generic.
* **id** Identifier of the page.
* **name** Name of the page (is shown as title)
* **content** Content (HTML) of the page.


#### `volume` page

The volume page can be used to set the volume used in the experiment.

* **type** must be volume.
* **id** Identifier of the page.
* **name** Name of the page (is shown as title)
* **content** Content (HTML) of the page.
* **stimulus** Filepath to the stimulus that is used for setting the volume.
* **defaultVolume** Default volume (must be between 0.0 and 1.0).

#### `finish` page

The finish page must be the last page of the experiment.

* **type** must be finish.
* **name** Name of the page (is shown as title).
* **content** Content (HTML) of the page. The content is shown on the upper part of the page.
* **showResults** The results are shown to the participant.  
* **writeResults** The results are sent to the remote service (which writes the results into a file).


## Results

The results are stored in the folder "/results". 
For each experiment, a subfolder is created having the name of the **testid** option. 
For each type of listening test, a CSV (comma separated values) file is created what contains the results.
